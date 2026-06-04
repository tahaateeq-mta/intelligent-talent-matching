# Intelligent Talent Matching Platform 
To access the website click here 👉 https://intelligent-talent-matching.vercel.app/

## Overview

The Intelligent Talent Matching Platform is a full-stack web application developed as part of a CSIT314 Architectural Engineering prototype project. The platform connects candidates and employers through an intelligent recommendation engine that matches users based on skills, education, experience, location preferences, and work arrangements.

The system provides role-based functionality for candidates, employers, and administrators while demonstrating modern software architecture principles, cloud integration, recommendation systems, and scalable application design.

---

# Features

## Candidate Features

* User registration and authentication
* Profile management
* Resume upload and storage
* Advanced job searching
* Fuzzy search with typo tolerance
* AI-inspired recommendation engine
* Job application tracking
* Personalized recommendations

## Employer Features

* Employer profile management
* Create job postings
* Edit and manage jobs
* Candidate recommendation engine
* Applicant tracking
* Candidate sourcing tools
* Membership-based recommendation access

## Administrator Features

* User management dashboard
* Membership management
* View all applications
* Platform monitoring
* Manage jobs across the system
* Access control management

---

# Technologies Used

## Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS

## Backend / Cloud Services

* Firebase Authentication
* Firestore Database
* Firebase Storage

## Algorithms / Processing

* Recommendation Scoring Engine
* Fuzzy Search Algorithm
* Levenshtein Distance Matching
* Ranking-Based Recommendation Logic

---

# System Architecture

The application follows a multi-role layered architecture:

Candidate Layer
↓
Authentication Layer
↓
Business Logic Layer
↓
Recommendation Engine
↓
Firebase Services Layer
↓
Firestore Database + Storage

---

# Recommendation Engine Logic

Candidate recommendations are generated using weighted scoring:

* Skill Matching → +10 points per match
* Work Mode Compatibility → +15 points
* Location Match → +20 points
* Experience Match → +10 points
* Education Match → +10 points

Premium users receive unlimited recommendation results while standard users receive the top 10 ranked recommendations.

---

# Search Engine Features

The platform implements:

* Fuzzy keyword matching
* Typo tolerance
* Approximate string matching
* Levenshtein distance calculations
* Compound filtering
* Multi-field search

---

# Installation

Clone repository:

```bash
git clone <repository-url>
cd intelligent-talent-matching
```

Install dependencies:

```bash
npm install
```

Create environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Run locally:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

---

# Project Structure

```text
src/
├── app/
│   ├── admin/
│   ├── candidate/
│   ├── employer/
│   ├── login/
│   └── register/
├── components/
├── config/
├── context/
├── types/
└── utils/
```

---

# Current Limitations

* Prototype implementation only
* Recommendation scoring is rule-based
* Limited recruiter analytics
* No real-time messaging system
* No payment integration for memberships

---

# Future Improvements

* Machine learning recommendation model
* Resume parsing
* AI-powered skill extraction
* Real-time notifications
* Subscription payments
* Advanced analytics dashboard
* Interview scheduling integration

---

# Authors

Developed for CSIT314 Architectural Engineering Project

Intelligent Talent Matching Platform Prototype
