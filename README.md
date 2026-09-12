# TracePoint - Issue Tracking & Workflow Management System

TracePoint is a full-stack MERN (MongoDB, Express, React, Node.js) application designed for issue tracking, task assignment, and automated workflow management. It integrates AI-driven capabilities to automatically summarize issues and recommend priority levels for developers.

---

## 🔗 Project Deliverables

* **GitHub Repository:** `https://github.com/muhammadawaisriaz75-stack/tracepoint-issue-tracker`

## 🛠️ Tech Stack & Prerequisites

* **Frontend:** React, Vite, Tailwind CSS, Axios
* **Backend:** Node.js, Express.js, JWT Authentication
* **Database:** MongoDB (Mongoose ODM)
* **AI Integration:** Groq API / Google Gemini API (LLM Integration)
* **Prerequisites:** Node.js (v18+ installed) and MongoDB running locally or via MongoDB Atlas.

---

## 🚀 Setup & Installation Instructions

### 1. Clone the Repository

git clone [https://github.com/muhammadawaisriaz75-stack/tracepoint-issue-tracker.git](https://github.com/muhammadawaisriaz75-stack/tracepoint-issue-tracker.git)
cd tracepoint-issue-tracker







2. Backend Setup

cd backend
npm install


Create a .env file in the /backend directory:

PORT=5050
MONGO_URI=mongodb://127.0.0.1:27017/tracepoint
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_gemini_or_groq_api_key


Start the backend server:

npm run dev





3. Frontend Setup

cd ../frontend
npm install


Start the frontend development server:

npm run dev








Open http://localhost:5173 in your browser.🗝️ Environment VariablesVariable NameDescriptionExample / RequiredPORTBackend server port5050MONGO_URIMongoDB Connection Stringmongodb://127.0.0.1:27017/tracepointJWT_SECRETSecret key for JWT authenticationcustom_jwt_secret_keyGEMINI_API_KEYAPI Key for AI SummarizationAIzaSy... or gsk_...



🗄️ Database Schema
1. User Schema (User.js)
name (String, Required)

email (String, Required, Unique)

password (String, Hashed, Required)

createdAt (Timestamp)




2. Issue Schema (Issue.js)
title (String, Required)

description (String, Required)

summary (String, AI generated or manual)

status (String, Enum: ['Open', 'In Progress', 'Resolved'], Default: 'Open')

priority (String, Enum: ['Low', 'Medium', 'High'], Default: 'Medium')

createdBy (ObjectId, Ref: 'User')

assignedTo (ObjectId, Ref: 'User')

createdAt / updatedAt (Timestamps)





📋 API Documentation
Auth Routes (/api/auth)
POST /api/auth/register — Register a new user.

POST /api/auth/login — Authenticate user & return JWT token.



Issue Routes (/api/issues)
GET /api/issues — Get all issues (Protected route).

POST /api/issues — Create a new issue (Protected route).

PUT /api/issues/:id — Update issue status, priority, or details (Protected route).

DELETE /api/issues/:id — Delete an issue (Protected route).

POST /api/issues/ai-summary — Trigger AI to analyze description and generate summary + priority.





🤖 AI Feature Explanation & Validation:

The AI integration helps developers quickly understand issue reports by distilling lengthy descriptions into concise summaries and automatically suggesting issue priority levels.





Validation & Parsing Strategy

Server-Side Sanitation: Requests are proxied through Node.js backend controllers to protect client-side API keys.

Schema & JSON Validation: AI responses are forced into standard JSON schemas. Fallback mechanisms handle network errors or key limits gracefully.

UI Error Handling: If the API fails or returns invalid key responses, user-friendly notifications (Toast alerts) guide the user without breaking the core app flow.








💡 Reflection & Key Learnings

What Was Learned:

Hands-on implementation of secure JWT token auth and environment configuration in MERN applications.

Integrating third-party LLM APIs (Gemini/Groq) securely via server-side Express endpoints.

Managing complex state and UI updates across dynamic forms in React.



What Was Difficult:

Managing API environment variable sync between local environments and handling dynamic response formats from AI models.

Resolving client-server connection edge cases and state synchronization during issue updates.






