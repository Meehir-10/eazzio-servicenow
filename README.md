# SMART CLASS AI 🎓
> **AI-Powered College ERP & Academic Management System**  
> *B.Tech Capstone / Mini-Project Submission*

---

## 🌟 Overview

**SMART CLASS AI** is a comprehensive, production-ready Academic Enterprise Resource Planning (ERP) platform built with Python and Django. It combines institutional administrative operations with an intelligent **Constraint-Based AI Timetable Generator**, real-time schedule conflict resolution, automated student broadcast notifications, attendance tracking, coursework submissions, and an interactive context-aware **AI Academic Assistant**.

---

## 🚀 Key Features & Modules

### 1. 🤖 AI Timetable Generator
- **Natural Language Parsing:** Automatically processes natural queries (e.g. *"Create a 5-day timetable for Semester 4 Section A starting at 9 AM with 6 slots"*).
- **Conflict Prevention Engine:** Mathematical constraint satisfaction algorithm that guarantees:
  - **Zero Faculty Collisions** (No teacher double-booked in overlapping periods).
  - **Zero Venue Clashes** (Classrooms and computing labs mapped dynamically).
  - **Lab Session Scheduling** (Practical subjects assigned to specialized labs).
  - **Even Subject Dispersion** (Prevents cognitive fatigue).
- **Metrics Dashboard:** Real-time optimization score percentage, total classes generated, and instant *"Apply to Live ERP"* deployment with student push alerts.

### 2. 👥 Role-Based Portals & Dashboards
- **Student Dashboard:** Today's lectures, attendance gauge with 75% regulatory alert, pending assignment tracker, upcoming holidays, notices, and AI chat assistant.
- **Faculty Dashboard:** Daily teaching schedule, instant 1-click attendance register, coursework creator, venue booking manager, and schedule modification panel.
- **Admin Command Center:** High-level college KPIs, student & staff rosters, infrastructure utilization, audit log of schedule substitutions, and timetable optimizer.

### 3. 🔔 Live Notifications & Schedule Changes
- Whenever a class is rescheduled, room relocated, or cancelled by a professor, automated notifications are instantly dispatched to enrolled students and staff.

### 4. 📊 Attendance & Academic Analytics
- 1-click classroom roll call with "Mark All Present" fast toggle.
- Subject-wise attendance breakdown and warning badges.
- Institutional workload and laboratory utilization analytics.

### 5. 📚 Coursework & Assignments
- Faculty can upload assignments with due dates and problem sheet attachments.
- Students upload submissions (files or report text).
- Faculty can score submissions and provide constructive grading feedback.

### 6. 💬 SMART CLASS AI Assistant
- Live context-aware chatbot answering queries on today's classes, attendance statistics, upcoming holidays, syllabus notices, and venue details.

---

## 🛠️ Technology Stack

- **Backend:** Python 3.9+, Django 4.2 (LTS)
- **Database:** SQLite 3
- **Frontend:** HTML5, CSS3, JavaScript (ES6), Bootstrap 5.3, FontAwesome 6
- **Algorithm:** Constraint-Satisfaction AI Scheduler

---

## 🔑 Demo Credentials (Ready to Test)

The project comes pre-seeded with full demonstration records:

| Role | Username | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Admin / Dean** | `admin` | `admin123` | Full administrative authority & AI tools |
| **Faculty / Teacher** | `prof_sharma` | `teacher123` | Assigned to Semester 4 CSE subjects |
| **Faculty / Teacher** | `prof_gupta` | `teacher123` | Assigned to Database & Networks |
| **Student** | `rohit_kumar` | `student123` | Semester 4 Section A (Roll: 21CS042) |
| **Student** | `ananya_sen` | `student123` | Semester 4 Section A (Roll: 21CS015) |

---

## 💻 Installation & Setup Guide

### Windows (PowerShell / Command Prompt)

```powershell
# 1. Clone repository
git clone https://github.com/Meehir-10/eazzio-servicenow.git
cd eazzio-servicenow

# 2. Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run migrations
python manage.py migrate

# 5. Populate pre-seeded demo records
python manage.py seed_demo_data

# 6. Start development server
python manage.py runserver
```

Open `http://127.0.0.1:8000/` in your browser.

---

### Linux / macOS

```bash
# 1. Clone repository
git clone https://github.com/Meehir-10/eazzio-servicenow.git
cd eazzio-servicenow

# 2. Setup environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Migrate and seed
python manage.py migrate
python manage.py seed_demo_data

# 4. Launch server
python manage.py runserver
```

---

## 🧪 Running Automated Tests

Run the comprehensive unit and integration test suite:

```bash
python manage.py test
```
