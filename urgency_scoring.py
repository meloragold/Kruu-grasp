import pandas as pd

df = pd.read_csv("data/emergency_messages.csv")

KEYWORDS = {
    "medical": {
        "words": ["unconscious", "injured", "bleeding", "pregnant", "breathing", "wounded"],
        "score": 35
    },
    "water": {
        "words": ["no water", "drinking water", "clean water"],
        "score": 15
    },
    "food": {
        "words": ["no food", "hungry", "food finished", "food supplies"],
        "score": 10
    },
    "vulnerable": {
        "words": ["children", "kids", "elderly", "senior citizen"],
        "score": 20
    },
    "trapped": {
        "words": ["trapped", "stuck", "cut off"],
        "score": 15
    },
    "disaster": {
        "words": ["flood", "fire", "collapsed", "landslide"],
        "score": 20
    },
    "evacuation": {
        "words": ["evacuation", "rescue", "ambulance"],
        "score": 20
    },
    "time": {
        "words": ["since", "days", "yesterday"],
        "score": 10
    }
}

def calculate_urgency(message):
    message = message.lower()
    score = 0
    reasons = []

    for category in KEYWORDS.values():
        for word in category["words"]:
            if word in message:
                score += category["score"]
                reasons.append(f"Detected '{word}'")

    return min(score, 100), reasons

if __name__ == "__main__":
    for _, row in df.iterrows():
        urgency, reasons = calculate_urgency(row["text"])
        print("\nMessage:", row["text"])
        print("Urgency Score:", urgency)
        print("Reasons:", reasons)