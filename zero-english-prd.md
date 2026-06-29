---
date: 29 Jun 2026
Developed By: Md. Mahir Asef
project_name: Zero English
title: Zero English Product Requirement Document (PRD)
version: 1
---

# 1. Project Overview

## Objective

Zero English is a bilingual vocabulary learning platform designed to
help English learners systematically master vocabulary through
structured CEFR levels, interactive quizzes, revision, progress
tracking, and personalized learning experiences.

## Primary Goals

-   Learn vocabulary from A1 to C2 levels
-   Full English and Bengali support
-   Quiz and revision systems
-   User progress tracking
-   PWA support
-   Future-ready architecture for AI features

# 2. User Roles

  Role              Permissions
  ----------------- ---------------------------------------------------
  Guest             Browse vocabulary and search words
  Registered User   Learning, quizzes, bookmarks, progress tracking
  Admin             Manage vocabulary, users, analytics, leaderboards

# 3. Core Features

-   Vocabulary Learning
-   Search System
-   Quiz System
-   Learned Words
-   Bookmarked Words
-   Still Learning Words
-   Mistaken Words Practice
-   Daily Goals
-   User Dashboard
-   PWA & Offline Support
-   Future Leaderboards
-   Future Gamification

# 4. Technical Stack

## Frontend

-   Next.js 16
-   React 19
-   TypeScript
-   Tailwind CSS 4
-   Zustand
-   Dexie
-   Radix UI
-   Motion

## Backend (Future)

-   Node.js
-   Express
-   PostgreSQL
-   Prisma ORM

# 5. Vocabulary Data Model

``` json
{
  "id": 1,
  "word": "a, an",
  "meaning_bn": "...",
  "definition_en": "...",
  "definition_bn": "...",
  "examples_en": [],
  "examples_bn": [],
  "synonyms": [],
  "level": "A1",
  "category": "Oxford3000",
  "parts_of_speech": "indefinite article"
}
```

# 6. Future Roadmap

-   Google Authentication
-   Leaderboards
-   Achievements
-   AI Tutor
-   AI Quizzes
-   Android App
-   iOS App

# 7. Notes

-   Bengali support is a first-class feature.
-   SEO should be prioritized from the beginning.
-   Architecture must remain modular and extensible.

**End**
