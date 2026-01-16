# 🚀 SimpleJS-RDBMS: A Custom Relational Engine

This project is a functional, from-scratch implementation of a **Relational Database Management System (RDBMS)** built using Node.js. It features a custom storage engine, a regex-based SQL parser, an interactive REPL, and a demonstration web application.

## 🏗️ System Architecture

The system is designed with a clear separation of concerns across four layers:

1.  **Storage Engine (`engine.js`)**: Manages JSON-based persistence, data integrity, and the **Primary Key Index**.
2.  **Query Parser (`parser.js`)**: Translates string-based SQL commands into executable JavaScript objects using Regular Expressions.
3.  **Interface Layer (`repl.js`)**: Provides an interactive Command Line Interface (CLI) for direct database manipulation.
4.  **Application Layer (`app.js`)**: An Express.js web server that utilizes the custom RDBMS for a real-world task management application.

---

## 🛠️ Key Technical Features

### 1. Data Persistence & Schema
Data is stored as **JSON arrays** within the `/data` directory. Each file represents a table. While the system allows for flexible row objects, it strictly enforces **Primary Key** uniqueness via the engine.

### 2. Basic Indexing
To avoid expensive $O(n)$ full table scans, the engine maintains an **In-Memory Hash Map** (`primaryIndex`).
* **Performance:** Primary key lookups are **$O(1)$**.
* **Integrity:** The index is checked instantly during `INSERT` and `UPDATE` operations to prevent duplicate IDs.

### 3. Query Engine & Joins
The engine supports relational logic through a **Nested Loop Join** algorithm.
* **Relational Logic:** Combines data from two tables based on matching column values.
* **Collision Handling:** Automatically prefixes columns with the table name (e.g., `tasks.id` vs `categories.id`) to ensure data clarity in the result set.

### 4. SQL-Like Parser
The system interprets standard SQL syntax through specialized Regex patterns:
* `SELECT * FROM table WHERE id = x`
* `INSERT INTO table VALUES (val1, val2)`
* `UPDATE table SET col = val WHERE id = x`
* `DELETE FROM table WHERE id = x`
* `SELECT ... JOIN ... ON ...`

---

## 🚦 Getting Started

### Prerequisites
* **Node.js** (v14 or higher)
* **NPM** (for Express.js)

### Installation
1.  **Clone the repository** and navigate to the folder.
2.  **Install dependencies**:
    ```bash
    npm install express
    ```
3.  **Seed the database** (creates the `/data` folder and initial records):
    ```bash
    node seed.js
    ```

### Running the System
* **Interactive Mode (REPL):** Execute SQL queries directly in your terminal:
    ```bash
    node repl.js
    ```
* **Web App Mode:** Start the Task Manager website:
    ```bash
    node app.js
    ```
    Once started, visit `http://localhost:3000` in your browser to interact with the UI.

---

## 📝 Credits & Attribution
Developed as a technical showcase to demonstrate core computer science concepts: **Persistence, Indexing, and Relational Algebra**. 

While the architecture mimics professional databases like SQLite, all core logic—including the **Indexing Map**, the **Regex Parser**, and the **Join Algorithm**—was implemented manually to demonstrate a deep understanding of database internals.