
import pandas as pd
import re
from transformers import pipeline

# Load dataset
df = pd.read_csv("data/emergency_messages.csv")

# Load Hugging Face NER
ner = pipeline(
    "ner",
    model="dslim/bert-base-NER",
    aggregation_strategy="simple"
)

# Rule-based needs
NEEDS = {
    "water": ["water", "drinking water", "clean water"],
    "food": ["food", "hungry", "food supplies"],
    "medical": ["ambulance", "injured", "unconscious", "pregnant", "bleeding", "breathing"],
    "rescue": ["rescue", "evacuation", "trapped", "stuck"],
    "shelter": ["homeless", "shelter", "blankets"]
}

# Urgency keywords
URGENCY_KEYWORDS = {
    "medical": (["unconscious", "injured", "bleeding", "pregnant", "breathing"], 35),
    "vulnerable": (["children", "kids", "elderly", "senior citizen"], 20),
    "trapped": (["trapped", "stuck", "cut off"], 15),
    "disaster": (["flood", "fire", "collapsed", "landslide"], 20),
    "time": (["since", "days", "yesterday"], 10)
}

def extract_entities(message):
    hf_entities = ner(message)
    message_lower = message.lower()

    # Quantity (from HF or regex fallback)
    quantity = None
    for ent in hf_entities:
        if ent["entity_group"] in ["CARDINAL", "QUANTITY"]:
            quantity = ent["word"]

    if not quantity:
        nums = re.findall(r"\b\d+\b", message)
        quantity = nums[0] if nums else None

    # Location (from HF)
    location = None
    for ent in hf_entities:
        if ent["entity_group"] == "LOC":
            location = ent["word"]

    # Needs (rule-based)
    needs_found = []
    for need, words in NEEDS.items():
        if any(word in message_lower for word in words):
            needs_found.append(need)

    return quantity, location, needs_found

def calculate_urgency(message):
    message_lower = message.lower()
    score = 0
    reasons = []

    for words, weight in URGENCY_KEYWORDS.values():
        for word in words:
            if word in message_lower:
                score += weight
                reasons.append(word)

    return min(score, 100), reasons

# 🔥 RUN PIPELINE
for _, row in df.iterrows():
    message = row["text"]

    quantity, location, needs = extract_entities(message)
    urgency, reasons = calculate_urgency(message)

    print("\n" + "="*60)
    print("MESSAGE:", message)
    print("NEEDS:", needs)
    print("PEOPLE AFFECTED:", quantity)
    print("LOCATION:", location)
    print("URGENCY SCORE:", urgency)
    print("URGENCY REASONS:", reasons)