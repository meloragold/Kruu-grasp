import os 
import pandas as pd
import re
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
# RESOURCE REGISTRY
# =========================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # <--- ensures paths work from anywhere
RESOURCES_FILE = os.path.join(BASE_DIR, "data", "resources.csv")
EMERGENCY_FILE = os.path.join(BASE_DIR, "data", "emergency_messages.csv")

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
    found = set()
    t = text.lower()
    for need, keywords in NEED_KEYWORDS.items():
        if any(k in t for k in keywords):
            found.add(need)
    return list(found)

def extract_people_count(text):
    match = re.search(r"(\d+)\s+(people|persons|families)", text.lower())
    return int(match.group(1)) if match else None

def extract_location(text):
    entities = ner(text)
    locations = [e["word"] for e in entities if e["entity_group"] == "LOC"]

    if not locations:
        return None, "unknown"

    confidence = "high"
    for loc in locations:
        if loc.lower() in AMBIGUOUS_LOCATIONS:
            confidence = "low"

    return locations, confidence

def calculate_urgency(text):
    score = 0
    reasons = []
    explanation = []

    t = text.lower()
    for key, value in URGENCY_RULES.items():
        if key in t:
            score += value
            reasons.append(key)
            explanation.append(f"Detected '{key}'")

    return score, reasons, explanation

# =========================
# RESOURCE MATCHING ENGINE
# =========================
def match_resources(needs, urgency_score, location_confidence):
    resources = fetch_live_resources()
    matched = []
    explanations = []

    if resources.empty:
        explanations.append("Resource registry unavailable")
        return matched, explanations

    for need in needs:
        available = resources[
            (resources["type"] == need) &
            (resources["status"] == "available")
        ]

        if not available.empty:
            row = available.iloc[0]
            matched.append({
                "name": row["name"],
                "type": row["type"],
                "eta": row["eta"],
                "status": row["status"]
            })

            explanations.append(
                f"Matched '{row['name']}' for '{need}' (urgency={urgency_score})"
            )
        else:
            explanations.append(f"No available resource for '{need}'")

    if location_confidence == "low":
        explanations.append("Ambiguous location — dispatcher confirmation required")

    explanations.append(
        f"Registry checked at {datetime.now().strftime('%H:%M:%S')}"
    )

    return matched, explanations

# =========================
# SINGLE MESSAGE PROCESSING (JSON-ready)
# =========================
def process_message(msg):
    msg = str(msg)

    needs = extract_needs(msg)
    people = extract_people_count(msg)
    location, loc_conf = extract_location(msg)
    urgency, reasons, explanation = calculate_urgency(msg)
    matched, resource_expl = match_resources(needs, urgency, loc_conf)

    alert_flag = urgency >= 30 or loc_conf != "high"

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
        "resource_log": resource_expl,
        "alert": alert_flag,
        "timestamp": datetime.now().isoformat()
    }

# =========================
# MULTI-MESSAGE PIPELINE (for CSV testing)
# =========================
def process_messages(messages):
    alerts = []
    for msg in messages:
        result = process_message(msg)
        if result["alert"]:
            alerts.append(result)
    return alerts

# =========================
# FASTAPI BACKEND
# =========================
app = FastAPI(title="Disaster Alert System")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket clients
clients: List[WebSocket] = []

# Pydantic model
class MessageInput(BaseModel):
    text: str

# API endpoint for single message
@app.post("/analyze")
async def analyze_message(data: MessageInput):
    result = process_message(data.text)

    # Push alert to WebSocket clients if urgent
    if result["alert"]:
        for client in clients:
            try:
                await client.send_json(result)
            except:
                clients.remove(client)

    return result

# WebSocket endpoint for live alerts
@app.websocket("/alerts")
async def alerts_ws(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep connection alive
    except:
        clients.remove(websocket)

# =========================
# MAIN (CSV test run + server)
# =========================
if __name__ == "__main__":
    print("⚡ Running CSV test mode...")
    try:
        df = pd.read_csv(EMERGENCY_FILE)
        alerts = process_messages(df["text"].astype(str).tolist())
        print("\n🔔 REAL-TIME ALERT QUEUE:")
        for alert in alerts:
            print(alert)
    except FileNotFoundError:
        print(f"❌ CSV file {EMERGENCY_FILE} not found. Skipping test run.")

    # Use environment variable for hackathon-friendly port
    port = int(os.environ.get("PORT", 8000))
    print(f"\n⚡ Starting FastAPI server on port {port} ...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)