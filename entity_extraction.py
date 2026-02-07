import pandas as pd
import re

df = pd.read_csv("data/emergency_messages.csv")

NEEDS = {
    "water": ["water", "drinking water", "clean water"],
    "food": ["food", "hungry", "food supplies"],
    "medical": ["ambulance", "injured", "unconscious", "pregnant", "bleeding"],
    "rescue": ["rescue", "evacuation", "trapped", "stuck"],
    "shelter": ["homeless", "shelter", "blankets"]
}

def extract_entities(message):
    message_lower = message.lower()

    # Need extraction
    needs_found = []
    for need, keywords in NEEDS.items():
        if any(word in message_lower for word in keywords):
            needs_found.append(need)

    # Quantity extraction
    quantity = re.findall(r"\b\d+\b", message)
    quantity = quantity[0] if quantity else None

    # Location extraction (simple heuristic)
    location = None
    for preposition in ["near", "at", "inside"]:
        if preposition in message_lower:
            location = message_lower.split(preposition)[-1].strip()
            break

    return {
        "needs": needs_found,
        "quantity": quantity,
        "location_text": location
    }

if __name__ == "__main__":
    for _, row in df.iterrows():
        entities = extract_entities(row["text"])
        print("\nMessage:", row["text"])
        print("Extracted Entities:", entities)