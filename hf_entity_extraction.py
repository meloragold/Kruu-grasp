from transformers import pipeline

ner = pipeline(
    "ner",
    model="dslim/bert-base-NER",
    aggregation_strategy="simple"
)

def extract_entities_hf(text):
    return ner(text)

if __name__ == "__main__":
    text = "No water for 3 days near railway bridge, 12 people including children"
    entities = extract_entities_hf(text)
    for e in entities:
        print(e)