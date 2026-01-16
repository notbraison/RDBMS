#  BraisDB - A Custom Relational Database Management System

A from-scratch implementation of a **Relational Database Management System (RDBMS)** built with Node.js, featuring a regex-based SQL parser, in-memory indexing, type validation, JOIN operations, and both CLI and web interfaces.


## ✨ Features

### Core Database Operations
-  **CRUD Operations**: Full Create, Read, Update, Delete support
-  **Type System**: STRING, INTEGER, FLOAT, BOOLEAN, DATE, JSON with validation
-  **Primary Key Indexing**: O(1) lookups using hash maps
-  **Relational Joins**: Nested Loop JOIN with ON conditions
-  **Column Collision Handling**: Table-prefixed column names (e.g., `tasks.id`, `categories.id`)
-  **Schema Persistence**: Schemas saved to `.schema.json` files

### Interfaces
-  **Interactive REPL**: SQL-like command interface
-  **REST API**: Full HTTP API for all operations
-  **Web UI**: Beautiful task manager dashboard

### Performance
- O(1) primary key lookups
- Efficient memory-based indexing
- JSON-based persistence

---

## 🛠️ Installation

### Prerequisites
- **Node.js** v14 or higher
- **NPM** (for dependencies)

### Setup

1. **Navigate to the project directory:**
   ```bash
   cd brais_db
   ```

2. **Install dependencies:**
   ```bash
   npm install express
   ```

3. **Create data directory** (if it doesn't exist):
   ```bash
   mkdir data
   ```

4. **Initialize test data** (optional):
   ```bash
   node seed.js
   ```

---

## 🏗️ Architecture

### System Layers

```
┌─────────────────────────────────────┐
│   Application Layer (app.js)        │ REST API & Web Interface
├─────────────────────────────────────┤
│   Interface Layer (repl.js)         │ SQL Parser & REPL
├─────────────────────────────────────┤
│   Query Parser (parser.js)          │ Regex-based SQL parsing
├─────────────────────────────────────┤
│   Storage Engine (engine.js)        │ Persistence & Indexing
└─────────────────────────────────────┘
         │
         ▼
    JSON File Storage
```

### Key Components

| File | Purpose |
|------|---------|
| `engine.js` | Storage engine, indexing, type validation |
| `parser.js` | SQL regex patterns for query parsing |
| `repl.js` | Interactive CLI interface |
| `app.js` | Express REST API server |
| `public/` | Web UI (HTML, CSS, JS) |

---

## 💻 Usage

### REPL Mode

Start the interactive command-line interface:

```bash
node repl.js
```

#### Available Commands

```
INSERT INTO table VALUES (val1, val2, ...)
SELECT * FROM table [WHERE col = val]
DELETE FROM table WHERE id = val
SELECT * FROM tableA JOIN tableB ON tableA.col = tableB.col
SCHEMA table
TABLES
HELP
```

#### REPL Examples

```
BRAIS_DB> TABLES
📊 Available Tables:
  - tasks: 0 rows, 3 columns
  - categories: 0 rows, 2 columns

BRAIS_DB> SCHEMA tasks
📋 Table: tasks
Rows: 0 | Columns: 3
Schema:
┌───────────┬──────────┐
│ (index)   │ Values   │
├───────────┼──────────┤
│ id        │ INTEGER  │
│ title     │ STRING   │
│ category_id│ INTEGER │
└───────────┴──────────┘

BRAIS_DB> INSERT INTO tasks VALUES (1, 'Learn Node.js', 1)
✓ Row inserted.

BRAIS_DB> SELECT * FROM tasks
┌─────────┬──────────────────┬─────────────┐
│ (index) │ id               │ title       │ category_id│
├─────────┼──────────────────┼─────────────┤
│ 0       │ 1                │'Learn Node' │ 1          │
└─────────┴──────────────────┴─────────────┘

BRAIS_DB> DELETE FROM tasks WHERE id = 1
✓ Row deleted.
```

---

### Web App Mode

Start the web server:

```bash
node app.js
```

Then open your browser to **http://localhost:3000**

#### Features
-  Create new tasks
-  View all tasks
-  Update task titles
-  Delete tasks
-  Real-time feedback

### Programmatic API

```javascript
const { BraisDB, TypeValidator } = require('./engine.js');

// Initialize a table with schema
const tasksDB = new BraisDB('tasks', {
    id: 'INTEGER',
    title: 'STRING',
    category_id: 'INTEGER'
});

// INSERT
tasksDB.insert({ id: 1, title: 'Learn Databases', category_id: 1 });

// SELECT ALL
const allTasks = tasksDB.selectAll();

// SELECT BY ID
const task = tasksDB.findById(1);

// UPDATE
tasksDB.update(1, { title: 'Master Databases' });

// DELETE
tasksDB.delete(1);

// GET SCHEMA
const schema = tasksDB.getSchemaInfo();

// GET TABLE INFO
const info = tasksDB.getTableInfo();
// Returns: { name: 'tasks', rows: 5, columns: 3, schema: {...} }

// JOIN
const joined = BraisDB.executeJoin(
    tasksDB.data,
    categoriesDB.data,
    'tasks',
    'categories',
    'category_id',
    'id'
);
```

---

## 🔤 Data Types

BraisDB supports the following data types with automatic validation and casting:

| Type | Example | Validation |
|------|---------|-----------|
| `STRING` | `"Hello"` | Must be a string |
| `INTEGER` | `42` | Must be a whole number |
| `FLOAT` | `3.14` | Must be a number |
| `BOOLEAN` | `true` | Must be true/false |
| `DATE` | `"2026-01-16"` | Must be valid date |
| `JSON` | `{key: "value"}` | Must be an object |

### Type Validation Example

```javascript
const db = new BraisDB('users', {
    id: 'INTEGER',
    email: 'STRING',
    active: 'BOOLEAN',
    score: 'FLOAT'
});

// ✓ Valid
db.insert({ id: 1, email: 'user@example.com', active: true, score: 95.5 });

// ✗ Type Error: email must be STRING
db.insert({ id: 2, email: 12345, active: true, score: 88 });
```

---

##  Test Cases

### Test 1: Basic CRUD Operations

```javascript
// Run in Node.js REPL
const { BraisDB } = require('./engine.js');
const db = new BraisDB('test_table', { id: 'INTEGER', name: 'STRING' });

// CREATE
db.insert({ id: 1, name: 'Alice' });
db.insert({ id: 2, name: 'Bob' });
console.log('✓ INSERT successful');

// READ
const all = db.selectAll();
console.log('✓ SELECT successful:', all);

const one = db.findById(1);
console.log('✓ FIND BY ID successful:', one);

// UPDATE
db.update(1, { name: 'Alice Updated' });
console.log('✓ UPDATE successful');

// DELETE
db.delete(1);
console.log('✓ DELETE successful');
```

**Expected Output:**
```
✓ INSERT successful
✓ SELECT successful: [{id: 1, name: 'Alice'}, {id: 2, name: 'Bob'}]
✓ FIND BY ID successful: {id: 1, name: 'Alice'}
✓ UPDATE successful
✓ DELETE successful
```

---

### Test 2: Type Validation

```javascript
const { BraisDB } = require('./engine.js');
const db = new BraisDB('type_test', {
    id: 'INTEGER',
    score: 'FLOAT',
    active: 'BOOLEAN'
});

// ✓ Valid types
db.insert({ id: 1, score: 95.5, active: true });
console.log('✓ Type validation passed');

// ✗ Invalid type (will throw error)
try {
    db.insert({ id: 'not-a-number', score: 95.5, active: true });
} catch (err) {
    console.log('✓ Type error caught:', err.message);
}
```

**Expected Output:**
```
✓ Type validation passed
✓ Type error caught: Type mismatch for column 'id': expected INTEGER, got string
```

---

### Test 3: Primary Key Constraint

```javascript
const { BraisDB } = require('./engine.js');
const db = new BraisDB('pk_test', { id: 'INTEGER', value: 'STRING' });

db.insert({ id: 1, value: 'first' });
console.log('✓ First insert successful');

// Try duplicate PK
try {
    db.insert({ id: 1, value: 'duplicate' });
} catch (err) {
    console.log('✓ PK constraint enforced:', err.message);
}
```

**Expected Output:**
```
✓ First insert successful
✓ PK constraint enforced: Primary Key Constraint Violated: ID 1 already exists.
```

---

### Test 4: JOIN Operation

```javascript
const { BraisDB } = require('./engine.js');

const tasks = new BraisDB('tasks', { id: 'INTEGER', title: 'STRING', cat_id: 'INTEGER' });
const categories = new BraisDB('categories', { id: 'INTEGER', name: 'STRING' });

// Populate data
tasks.insert({ id: 1, title: 'Learn DB', cat_id: 1 });
tasks.insert({ id: 2, title: 'Learn SQL', cat_id: 1 });
categories.insert({ id: 1, name: 'Education' });

// JOIN
const result = BraisDB.executeJoin(
    tasks.data,
    categories.data,
    'tasks',
    'categories',
    'cat_id',
    'id'
);

console.log('✓ JOIN result:', result);
```

**Expected Output:**
```
✓ JOIN result: [
  {
    'tasks.id': 1,
    'tasks.title': 'Learn DB',
    'tasks.cat_id': 1,
    'categories.id': 1,
    'categories.name': 'Education'
  },
  {
    'tasks.id': 2,
    'tasks.title': 'Learn SQL',
    'tasks.cat_id': 1,
    'categories.id': 1,
    'categories.name': 'Education'
  }
]
```

---

### Test 5: REPL Commands

```bash
$ node repl.js

BRAIS_DB> INSERT INTO tasks VALUES (1, 'Build RDBMS', 1)
✓ Row inserted.

BRAIS_DB> SELECT * FROM tasks
┌─────────┬────┬────────────────┬─────────────┐
│ (index) │ id │ title          │ category_id │
├─────────┼────┼────────────────┼─────────────┤
│ 0       │ 1  │ Build RDBMS    │ 1           │
└─────────┴────┴────────────────┴─────────────┘

BRAIS_DB> SCHEMA tasks
 Table: tasks
Rows: 1 | Columns: 3

BRAIS_DB> DELETE FROM tasks WHERE id = 1
✓ Row deleted.
```

##  Notes

- Data is persisted to JSON files in the `./data/` directory
- Schemas are automatically saved to `.schema.json` files
- Type validation happens automatically on INSERT and UPDATE
- All numeric IDs are auto-cast to integers
- Table names are case-insensitive
