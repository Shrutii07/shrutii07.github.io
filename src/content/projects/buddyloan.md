---
title: "BuddyLoan - Your All-in-One Loan Application"
description: "BuddyLoan is a scalable, full-stack web application designed to serve as a centralized platform for managing all user loan repayment schedules. The application features an intuitive and secure Angular frontend for seamless interaction. The robust backend utilizes Spring Boot microservices, organized via Netflix Eureka and routed through Spring Cloud Gateway, ensuring reliability and fast performance. Spring Security was implemented to safeguard user and financial data stored in the MySQL database (accessed via Spring-JPA). This architecture emphasizes fast load times and provides users with a comprehensive, secure hub for tracking and managing their loan obligations."
image: "/images/projects/buddyloan.png"
github: "https://github.com/Shrutii07/BuddyLoan"
demo: "https://youtu.be/9on63Mj7oV8"
featured: true
order: 3
tags: ["Angular", "MySQL", "Spring-JPA", "Java", "Spring Cloud"]
startDate: "2024-04"
endDate: "2024-05"
award: "🏆 1st Place Winner"
hackathon: "NatWest Challenge 24 Hackathon"
---

# Large-Scale Social Media Sentiment Analysis

## Overview

Built a comprehensive real-time sentiment analysis system capable of processing millions of social media posts per day. The system provides insights into public opinion trends, brand sentiment, and emerging topics across multiple social platforms.

## Key Features

- **Real-time Processing**: Handles 10,000+ posts per minute
- **Multi-platform Support**: Twitter, Reddit, Facebook, Instagram
- **Advanced NLP**: Fine-tuned BERT models for domain-specific sentiment
- **Interactive Dashboard**: Real-time visualization of sentiment trends

## Technical Implementation

### Model Development
- Fine-tuned DistilBERT on social media dataset (1M+ labeled posts)
- Custom preprocessing pipeline for social media text
- Emotion classification beyond basic sentiment (joy, anger, fear, etc.)
- Multilingual support for English, Spanish, and French

### System Architecture
- Apache Kafka for real-time data streaming
- Redis for caching and session management
- PostgreSQL for historical data storage
- Elasticsearch for fast text search and analytics

### Scalability & Performance
- Kubernetes deployment with auto-scaling
- Load balancing across multiple model instances
- Batch processing for historical analysis
- API rate limiting and request optimization

## Results

- **Processing Speed**: 10,000+ posts per minute
- **Model Accuracy**: 91% F1-score on test dataset
- **System Uptime**: 99.7% availability
- **Response Time**: <200ms average API response

## Business Impact

The system has been used by marketing teams to monitor brand sentiment during product launches, resulting in:
- 25% faster response to negative sentiment trends
- 15% improvement in customer satisfaction scores
- Real-time insights that influenced 3 major marketing campaigns

## Dashboard Features

- Real-time sentiment trend visualization
- Geographic sentiment mapping
- Keyword and hashtag analysis
- Automated alert system for sentiment spikes
- Historical trend comparison and reporting

## Technologies Used

- **NLP**: Transformers, BERT, spaCy, NLTK
- **Streaming**: Apache Kafka, Apache Spark
- **Backend**: FastAPI, PostgreSQL, Redis
- **Frontend**: React, D3.js, Chart.js
- **Infrastructure**: Docker, Kubernetes, AWS