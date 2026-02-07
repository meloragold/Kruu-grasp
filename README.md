🚨 CRISIS AI
Disaster Alert & Resource Matching System

An AI-powered system that interprets high-stress emergency messages, extracts critical entities, assigns a transparent urgency score, and matches requests to verified emergency resources in real time.

🌍 Problem Context

During natural disasters and local emergencies, requests for help arrive as short, unstructured text via SMS and social media.

Manual triage becomes slow, inconsistent, and error-prone, especially when:

📍 Locations are ambiguous

🔀 Multiple needs appear in a single message

⚠️ Urgency is unclear

🚑 Resource availability changes dynamically

🎯 System Objective

Design an AI system that:

Extracts Need, Quantity, Location, and Urgency

Handles ambiguous location data gracefully

Matches needs against a live resource registry

Clearly explains why a request is prioritized to human dispatchers

🧠 What This System Does
🔍 Entity Extraction

Uses BERT-based Named Entity Recognition

Detects:

🧾 Needs (food, water, medical, rescue, shelter)

👥 People affected

📍 Locations (with confidence level)

⚡ Transparent Urgency Scoring

Urgency is calculated using explicit, rule-based signals, including:

🔥 Fire, 🌊 flood, 🪨 landslide

🩸 Injuries, bleeding, unconsciousness

👶 Vulnerable groups (children, elderly, pregnant)

➡️ Every contributing factor is logged and returned, enabling full human oversight and trust.

🚑 Resource Matching Engine

Matches extracted needs against a CSV-based live resource registry

Scores resources based on:

✅ Availability

⏱️ ETA

⚠️ Message urgency

📍 Location confidence

➡️ Returns the best-matched resource along with a clear explanation of the decision.

📡 Live Alerts (Local)

Urgent messages are broadcast via WebSockets

The frontend updates instantly as new alerts arrive

🖥️ Tech Stack
🔧 Backend

FastAPI

HuggingFace Transformers (BERT NER)

Pandas

WebSockets

🎨 Frontend

React / Next.js

Tailwind CSS

WebSocket Client
