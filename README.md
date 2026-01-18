## Live at: https://swades.onrender.com

# SWADES.AI  
**AI-Powered Customer Support System using Multi-Agent Architecture**

This is a full-stack AI-powered customer support platform designed using a **multi-agent architecture**.  
The system intelligently routes user queries to specialized AI agents, maintains conversational context, and provides structured, reliable responses through a modern web interface.

This project was built with a **production-oriented mindset**, focusing on clean architecture, modularity, and real-world scalability.

---

## 📌 Key Highlights

- Multi-agent AI system (Router + Specialized Agents)
- Context-aware conversations with memory
- Clean separation of concerns (Controllers, Services, Tools)
- Type-safe backend using TypeScript
- Modern frontend using React + Vite
- Database-ready architecture using Drizzle ORM

---

## 🧠 System Architecture (High Level)

User → Frontend (React)
→ Backend API (Hono)
→ Router Agent
→ Specialized Agent(s)
→ Tool Calls / DB / AI Models
→ Structured AI Response


The **Router Agent** acts as the brain of the system, deciding which specialized agent should handle each query.

## 📂 Repository Structure

```
SWADES/
├── Backend/
│   ├── src/
│   │   ├── controllers/       # HTTP request handlers
│   │   ├── services/          # Core business logic & agents
│   │   ├── db/                # Database connection & schema
│   │   ├── lib/               # Shared utilities
│   │   ├── types/             # Global TypeScript types
│   │   └── index.ts           # Backend entry point
│   │
│   ├── .env.example           # Environment variable template
│   ├── drizzle.config.ts      # Drizzle ORM configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── Frontend/
│   ├── src/
│   │   ├── components/        # UI components
│   │   ├── pages/             # Application pages
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # API utilities
│   │   └── main.tsx           # Frontend entry
│   │
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Backend Architecture (Main Focus)

The backend is built using **Node.js + TypeScript + Hono**, following a layered architecture.

### 1️⃣ Entry Point (`src/index.ts`)
- Initializes the Hono server
- Registers API routes
- Sets up middleware
- Starts the HTTP server

---

### 2️⃣ Controllers Layer (`controllers/`)

Controllers are responsible for:
- Receiving HTTP requests
- Validating inputs
- Calling the appropriate service
- Returning structured responses

Example responsibilities:
- `chat-controller.ts` → Handles chat messages
- `agent-controller.ts` → Handles agent-related operations

> Controllers do NOT contain business logic.

---

### 3️⃣ Services Layer (`services/`)

This is the **heart of the system**.

#### `agent-service.ts`
- Implements the **Router Agent**
- Analyzes user intent
- Decides which specialized agent should respond
- Maintains conversation context

#### `agent-tools.ts`
- Defines tools that agents can call
- Examples:
  - Fetching agent capabilities
  - Querying stored conversations
  - Performing structured actions

> This layer contains **decision-making logic**, not HTTP logic.

---

### 4️⃣ Multi-Agent Design

The system uses:
- **Router Agent** → Classifies the query
- **Specialized Agents** → Handle specific tasks

Each agent:
- Has a clear responsibility
- Can call tools
- Returns structured output

This design makes the system:
- Scalable
- Easy to extend
- Easy to debug

---

### 5️⃣ Database Layer (`db/`)

- Uses **Drizzle ORM**
- Fully type-safe
- Schema-first approach

Files:
- `schema.ts` → Defines database tables and relations
- `index.ts` → Database connection setup

The database is used to store:
- Conversations
- Messages
- Agent metadata (if needed)

---

### 6️⃣ Types & Utilities

#### `types/`
- Shared TypeScript interfaces
- Ensures consistency across layers

#### `lib/utils.ts`
- Helper functions
- Reusable logic
- Keeps code DRY

---

## 🧪 Environment Variables

The backend requires environment variables.

### `.env.example`

```env
DATABASE_URL=postgres://user:password@localhost:5432/swades
GOOGLE_API_KEY=your_google_key_here
```

## 🚀 Installation & Setup

---

### **Prerequisites**
- **Node.js ≥ 18**
- **npm**
- **PostgreSQL** (optional, only if DB features are used)

---

### 🔧 **Backend Setup**

```bash
cd Backend
npm install
cp .env.example .env
npm run dev
```
Backend will start on:
```
http://localhost:5000
```
### 🎨 **Frontend Setup**

```bash
cd Frontend
npm install
npm run dev
```

Frontend will start on:
```
http://localhost:3000
```
### 🔁 **API Flow (Chat Example)**
- User sends message from UI
- Frontend calls /chat API
- Controller receives request
- Router Agent analyzes intent
- Appropriate agent is selected
- Agent may call tools / DB
- AI response is generated
- Response is sent back to UI
