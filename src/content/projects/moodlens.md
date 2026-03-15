---
title: "MoodLens: Multi-Modal Depression Screening"
description: "MoodLens is a passive, always-on depression screening system that requires zero active effort from the user — no surveys, no manual check-ins. It fuses two independent ML pipelines — an XGBoost biometric model (HRV, sleep, steps via Google Health Connect) and a fine-tuned multiMentalRoBERTa NLP model (F1: 0.835) — into a single PHQ-9-aligned risk score through a weighted ensemble with hard safety overrides. Suicidal ideation detection bypasses all scoring logic for immediate Tier 2 escalation. The system automatically routes users across three tiers to one of four purpose-built ElevenLabs voice agents: on-demand Companion (Tier 0), proactive AI Coach with RAG-powered clinical strategies (Tier 1), or a full human-in-the-loop Responder protocol with emergency contact alerting (Tier 2). The goal: reach people in the weeks before a breaking point — not the day after."
image: "images/projects/moodlens.png"
github: "https://github.com/sciankit/Depression_Screen"
demo: "https://mymoodlens.vercel.app/"
video: "https://www.youtube.com/watch?v=bELvE8N3xHI"
featured: true
startDate: "2026-02"
endDate: "2026-03"
tags: ["Agentic AI", "ElevenLabs Voice", "multiMentalRoBERTa", "XGBoost", "Databricks"]
hackathon: "Hacklytics 2026: Golden Byte"
---
