import math

RESOURCES = [
    {"id": "R1", "type": "water", "location": "railway bridge", "available": True},
    {"id": "R2", "type": "medical", "location": "temple", "available": True},
    {"id": "R3", "type": "rescue", "location": "bus stand", "available": False},
    {"id": "R4", "type": "food", "location": "school", "available": True},
    {"id": "R5", "type": "shelter", "location": "community hall", "available": True}
]

def match_resources(needs, location_text):
    matched = []

    for resource in RESOURCES:
        if resource["type"] in needs and resource["available"]:
            matched.append(resource)

    return matched

if __name__ == "__main__":
    test_needs = ["water", "medical"]
    test_location = "near railway bridge"

    results = match_resources(test_needs, test_location)
    print("\nMatched Resources:")
    for r in results:
        print(r)