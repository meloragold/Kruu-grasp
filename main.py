import os
import re
import asyncio
import pandas as pd
from datetime import datetime
from transformers import pipeline
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn

# =========================
# LOAD NER MODEL
# =========================
ner = pipeline(
    "ner",
    model="dslim/bert-base-NER",
    aggregation_strategy="simple"
)

# =========================
# CONFIGURATION
# =========================
AMBIGUOUS_LOCATIONS = {
    "temple", "school", "bridge", "market", "bus stand",
    "community hall", "canal", "apartment", "hill road"
}

NEED_KEYWORDS = {
    "water": ["water", "drinking"],
    "food": ["food", "hungry"],
    "medical": ["medical", "injured", "ambulance", "bleeding", "unconscious", "oxygen"],
    "rescue": ["rescue", "trapped", "stuck", "evacuation"],
    "shelter": ["shelter", "blankets", "homeless"]
}

URGENCY_RULES = {
    "children": 20,
    "kids": 20,
    "elderly": 20,
    "senior citizen": 10,
    "pregnant": 35,
    "unconscious": 20,
    "bleeding": 25,
    "fire": 20,
    "flood": 15,
    "trapped": 25,
    "injured": 20,
    "landslide": 25
}

# =========================
# FILE PATHS
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")

RESOURCES_FILE = os.path.join(DATA_DIR, "resources.csv")
EMERGENCY_FILE = os.path.join(DATA_DIR, "emergency_messages.csv")

# =========================
# RESOURCE REGISTRY
# =========================
def fetch_live_resources():
    try:
        return pd.read_csv(RESOURCES_FILE)
    except FileNotFoundError:
        print(f"❌ {RESOURCES_FILE} not found")
        return pd.DataFrame()

# =========================
# EXTRACTION FUNCTIONS
# =========================
def extract_needs(text):
    t = text.lower()
    return [need for need, keys in NEED_KEYWORDS.items() if any(k in t for k in keys)]

def extract_people_count(text):
    match = re.search(r"(\d+)\s+(people|persons|families)", text.lower())
    return int(match.group(1)) if match else None

def extract_location(text):
    entities = ner(text)
    locations = [e["word"] for e in entities if e["entity_group"] == "LOC"]

    if not locations:
        return None, "unknown"

    confidence = "low" if any(l.lower() in AMBIGUOUS_LOCATIONS for l in locations) else "high"
    return locations, confidence

def calculate_urgency(text):
    score = 0
    reasons, explanation = [], []

    for key, value in URGENCY_RULES.items():
        if key in text.lower():
            score += value
            reasons.append(key)
            explanation.append(f"Detected '{key}'")

    return score, reasons, explanation

# =========================
# RESOURCE MATCHING
# =========================
def match_resources(needs, urgency_score, location_confidence):
    resources = fetch_live_resources()
    matched, explanations = [], []

    if resources.empty:
        return [], ["Resource registry unavailable"]

    for need in needs:
        candidates = resources[resources["type"] == need]

        scored = []
        for _, r in candidates.iterrows():
            score = urgency_score
            reasons = []

            if r["status"] != "available":
                score -= 40
                reasons.append("Resource busy")
            else:
                score += 10
                reasons.append("Resource available")

            eta = int(re.search(r"\d+", str(r["eta"])).group())
            score -= eta
            reasons.append(f"ETA penalty {eta} min")

            if location_confidence == "low":
                score -= 15
                reasons.append("Ambiguous location")

            scored.append({
                "name": r["name"],
                "type": r["type"],
                "status": r["status"],
                "eta": r["eta"],
                "priority_score": score,
                "reason": reasons
            })

        if scored:
            best = max(scored, key=lambda x: x["priority_score"])
            matched.append(best)
            explanations.append(
                f"Selected {best['name']} for '{need}' (score={best['priority_score']})"
            )

    return matched, explanations

# =========================
# MESSAGE PROCESSING
# =========================
def process_message(msg):
    needs = extract_needs(msg)
    people = extract_people_count(msg)
    location, loc_conf = extract_location(msg)
    urgency, reasons, explanation = calculate_urgency(msg)
    matched, resource_log = match_resources(needs, urgency, loc_conf)

    return {
        "message": msg,
        "needs": needs,
        "people_affected": people,
        "location": location,
        "location_confidence": loc_conf,
        "urgency_score": urgency,
        "urgency_reasons": reasons,
        "urgency_explanation": explanation,
        "matched_resources": matched,
        "resource_log": resource_log,
        "alert": urgency >= 30 or loc_conf != "high",
        "timestamp": datetime.now().isoformat()
    }

# =========================
# FASTAPI APP
# =========================
app = FastAPI(title="Disaster Alert System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

clients: List[WebSocket] = []

class MessageInput(BaseModel):
    text: str

# =========================
# API ROUTES
# =========================
@app.post("/analyze")
async def analyze_message(data: MessageInput):
    result = process_message(data.text)

    if result["alert"]:
        for client in clients.copy():
            try:
                await client.send_json(result)
            except:
                clients.remove(client)

    return result

@app.get("/resources")
async def get_resources():
    df = fetch_live_resources()
    return df.to_dict(orient="records") if not df.empty else []

# =========================
# WEBSOCKET
# =========================
@app.websocket("/alerts")
async def alerts_ws(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        clients.remove(websocket)

# =========================
# AUTO STREAM ALERTS (🔥 KEY FIX)
# =========================
async def stream_demo_alerts():
    await asyncio.sleep(2)

    if not os.path.exists(EMERGENCY_FILE):
        print("❌ emergency_messages.csv missing")
        return

    df = pd.read_csv(EMERGENCY_FILE)

    for text in df["text"].astype(str):
        alert = process_message(text)

        if alert["alert"]:
            for client in clients.copy():
                try:
                    await client.send_json(alert)
                except:
                    clients.remove(client)

        await asyncio.sleep(3)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(stream_demo_alerts())

# =========================
# MAIN
# =========================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"⚡ Server running on port {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
