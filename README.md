# CodeOpt — Compiler Optimization Engine

A full-stack academic **Compiler Design & Optimization Platform** built to demonstrate how a modern compiler processes source code and applies multi-pass optimization techniques.

The application allows students, professors, and researchers to write a defined C-like language subset, trace through every intermediate stage of the compiler pipeline, visualize Abstract Syntax Trees (AST) and Control Flow Graphs (CFG), and observe how individual optimization passes transform Intermediate Representation (IR) instructions with complete mathematical and semantic justifications.

---

## 📸 Visual Design & Philosophy

The user interface follows the clean, professional SaaS dashboard design inspired by modern dashboard aesthetics:
- **Left Navigation Sidebar:** Quick navigation between Dashboard, Compiler Studio, Projects, Optimization History, Documentation, and Settings.
- **Top Header Bar:** Global search, notifications, message hub, and researcher profile controls.
- **Top Quick Action Cards:** Three vibrant cards highlighting Active Optimization Passes, Daily Reduction Progress (e.g. 82% TAC reduction), and the Compiler Pipeline Guide.
- **Two-Column Analytics Grid:** Active Compiler Projects, Language & Pipeline metadata cards, an Activity Chart with rounded blue pillars on light-blue tracks, a Date Calendar widget, and an Upcoming Tasks timeline.
- **Compiler Studio:** Split-pane development environment with Code Editor (syntax errors highlighted inline with line/column pointers), Step-Through Compiler Tour, and 13 comprehensive pipeline tabs.

---

## 🏗️ Architecture

```
                    ┌─────────────────────────┐
                    │      React Frontend     │
                    │   (Port 8082 • Vite/JS) │
                    └────────────┬────────────┘
                                 │ REST API / JSON
                                 ▼
                    ┌─────────────────────────┐
                    │    Node.js + Express    │
                    │       (Port 8081)       │
                    └──────┬────────────┬─────┘
                           │            │
                           ▼            ▼
               ┌────────────────┐   ┌─────────────────┐
               │ Python 3 Engine│   │ MongoDB Server  │
               │  (Compiler CLI)│   │  (Port 27017)   │
               └────────────────┘   └─────────────────┘
```

1. **Frontend (React):** Communicates with the Express API via Axios. Features custom interactive AST tree rendering, CFG visualizer, side-by-side split compare diffs, and step-through compiler controls.
2. **Backend (Node.js + Express):** Handles JWT authentication, MongoDB persistence for users, projects, and compilation history, and spawns the Python compiler engine via child processes.
3. **Compiler Engine (Python 3):** A manual implementation of Lexer, Recursive-Descent Parser, AST, Scoped Symbol Table, Semantic Analyzer, Three-Address Code (TAC) Generator, Basic Block partitioner, CFG builder, Multi-Pass Optimizer, and C-like Code Generator.

---

## ⚙️ The 7-Stage Compiler Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Source Code │ ──> │    Tokens    │ ──> │  Parse Tree  │ ──> │     AST      │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                       │
┌──────────────┐     ┌──────────────┐     ┌──────────────┐             │
│ Optimized IR │ <── │ Basic Blocks │ <── │  Initial IR  │ <───────────┘
│    & Code    │     │    & CFG     │     │    (TAC)     │
└──────────────┘     └──────────────┘     └──────────────┘
```

1. **Lexical Analysis (Scanner):** Identifies keywords, identifiers, numbers, booleans, operators, separators, and delimiters with exact line and column coordinates.
2. **Syntax Analysis (Parser):** Validates syntax using recursive-descent parsing according to context-free grammar; reports exact expected vs. actual tokens.
3. **Abstract Syntax Tree (AST):** Builds an expandable/collapsible visual tree node graph.
4. **Semantic Analysis & Symbol Table:** Validates variable declarations, detects undeclared/duplicate identifiers, enforces static type safety, and constructs scoped symbol tables.
5. **Intermediate Representation (IR):** Emits Three-Address Code (TAC) with linear temporaries (`t1, t2...`) and control labels (`L1, L2...`).
6. **Basic Blocks & CFG:** Partitions TAC using the Leader algorithm and builds a Control Flow Graph with labeled branches (`true`, `false`, `goto`, `fallthrough`).
7. **Optimization Passes:** Applies multi-pass transformations and regenerates formatted C-like source code.

---

## 🚀 Optimization Passes Implemented

| Pass | Optimization Technique | Example Transformation | Academic Rationale |
|---|---|---|---|
| **Pass 1** | **Constant Folding** | `t1 = 10 * 20` → `t1 = 200` | Operands are compile-time constants; computes results ahead of execution. |
| **Pass 2** | **Constant Propagation** | `x = 10; y = x + 5` → `y = 15` | Replaces variable references with known constant values across valid execution paths. |
| **Pass 3** | **Algebraic Simplification** | `y = x + 0` → `y = x`<br>`z = y * 1` → `z = y`<br>`w = x * 0` → `w = 0` | Exploits mathematical identity axioms to reduce ALU operation costs. |
| **Pass 4** | **Copy Propagation** | `x = y; z = x + 10` → `z = y + 10` | Replaces occurrences of copied variables to unlock further optimizations. |
| **Pass 5** | **Common Subexpression Elimination (CSE)** | `a = x * y; b = x * y` → `b = a` | Detects redundant duplicate computations and reuses previously computed values. |
| **Pass 6** | **Strength Reduction** | `x * 2` → `x + x` | Replaces high-latency arithmetic operations with faster equivalent additions. |
| **Pass 7** | **Dead Code Elimination (DCE)** | `unused = 500;` → `[Removed]` | Discards variable assignments whose values are never subsequently referenced. |
| **Pass 8** | **Unreachable Code Elimination** | `if (false) { a = 100; }` → `[Eliminated]` | Prunes dead branch blocks guarded by statically false conditions or after gotos. |

---

## 💻 Supported Source Language Subset

- **Data Types:** `int`, `float`, `bool`
- **Variable Declarations:** `int x = 10; float price = 25.5; bool active = true;`
- **Arithmetic Operators:** `+`, `-`, `*`, `/`, `%`
- **Comparison Operators:** `<`, `>`, `<=`, `>=`, `==`, `!=`
- **Logical Operators:** `&&`, `||`, `!`
- **Assignments:** `=`, `+=`, `-=`, `*=`, `/=`
- **Conditionals:** `if (...) { ... } else { ... }`
- **Loops:** `while (...) { ... }`, `for (int i = 0; i < 10; i = i + 1) { ... }`
- **I/O Functions:** `print(x);`
- **Blocks:** `{ ... }`

---

## 📁 Repository Structure

```
CodeOpt/
├── backend/
│   ├── controllers/         # Auth, Compiler, Project, History, Stats controllers
│   ├── middleware/          # JWT Auth and Error handling
│   ├── models/              # User, Project, CompilationHistory Mongoose schemas
│   ├── routes/              # Express API route declarations
│   ├── services/            # Compiler execution service (spawns Python)
│   ├── tests/               # E2E automated test suite
│   ├── .env.example         # Template environment variables
│   ├── .env                 # Port 7071 configuration
│   ├── package.json
│   └── server.js            # Express server entrypoint
│
├── compiler/
│   ├── ast/                 # AST Node classes and visual tree serialization
│   ├── basic_blocks/        # Basic block partitioner and CFG builder
│   ├── codegen/             # Optimized C-like source code generator
│   ├── ir/                  # TAC instruction definitions and IR generator
│   ├── lexer/               # Token definitions and lexical analyzer
│   ├── optimizer/           # Multi-pass optimization engine & 8 passes
│   ├── parser/              # Recursive-descent parser and parse tree builder
│   ├── semantic/            # Type checker, scope validator, and diagnostics
│   ├── symbol_table/        # Scoped Symbol Table structure
│   ├── tests/               # Unit test suite (7 unittest test cases)
│   ├── compiler_engine.py   # Master pipeline orchestrator
│   └── main.py              # CLI & JSON bridge entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── components/      # CodeEditor, AstVisualizer, CfgVisualizer, PassViewer, CompareViewer
│   │   ├── context/         # AuthContext with session and demo login
│   │   ├── layouts/         # DashboardLayout (Sidebar, Top Header, Profile)
│   │   ├── pages/           # Landing, Login, Register, Dashboard, Compiler, Projects, History, Docs, Settings
│   │   ├── services/        # Axios API client
│   │   ├── App.jsx          # Router and route guards
│   │   ├── index.css        # SaaS design system styles
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js       # Port 7072 dev server configuration
│
└── README.md
```

---

## 🛠️ Setup & Running Instructions

### 1. Prerequisites
- **Python:** Python 3.8+ (Tested on Python 3.13)
- **Node.js:** v18+ (Tested on Node.js v22)
- **MongoDB:** MongoDB Community Server running on `127.0.0.1:27017`

### 2. MongoDB Setup
Ensure MongoDB service is running:
- Default connection URI: `mongodb://127.0.0.1:27017/codeopt`
- Inspect collections using **MongoDB Compass** by connecting to `mongodb://localhost:27017`.

### 3. Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend starts at **`http://localhost:8081`**.

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend starts at **`http://localhost:8082`**.

---

## 🧪 Testing

### 1. Python Compiler Unit Tests
```bash
python -m unittest compiler/tests/test_compiler.py
```
*Validates Lexer, Parser, Semantic Analyzer, and Optimizer passes.*

### 2. Full End-to-End (E2E) Test Suite
```bash
node backend/tests/test_e2e.js
```
*Verifies Frontend (Port 7072) and Backend (Port 7071) endpoints, authentication, project creation, compilation, history recording, and statistics.*

---

## 🎓 Academic Viva Voce Questions & Answers

1. **Q: Why does CodeOpt generate Three-Address Code before optimization?**
   *A:* Three-Address Code linearizes complex nested AST expressions into instructions with at most one operator and three addresses. This uniform representation enables machine-independent optimizations like Common Subexpression Elimination and Constant Propagation to operate predictably across any source language construct.

2. **Q: What algorithm is used to partition Three-Address Code into Basic Blocks?**
   *A:* The Leader Algorithm. The first instruction, any branch target (label), and any instruction immediately following a branch are leaders. A basic block begins at a leader and includes all instructions up to the next leader.

3. **Q: Does an instruction reduction of 60% mean the compiled program runs 60% faster?**
   *A:* No. Instruction count measures the static size of generated intermediate code. Execution time depends on dynamic hardware factors including CPU instruction latency (e.g. division vs addition), cache hit rates, pipelining, and branch prediction.

---

## 🛡️ License
Academic Compiler Design Project. All compiler algorithms implemented manually.
