#  BraisDB - A Custom Relational Database Management System

A from-scratch implementation of a **Relational Database Management System (RDBMS)** built with Node.js, featuring a regex-based SQL parser, in-memory indexing, type validation, JOIN operations, and both CLI and web interfaces.

##  Features

-  **Full CRUD** with type validation (STRING, INTEGER, FLOAT, BOOLEAN, DATE, JSON)
-  **Primary Key Indexing** - O(1) lookups using hash maps
-  **Relational Joins** - Nested Loop JOIN with ON conditions and column collision handling
-  **3 Interfaces** - REPL CLI, REST API, and Web UI
-  **Schema Persistence** - Schemas saved to `.schema.json` files

##  Quick Start

```bash
cd brais_db
npm install express
mkdir data
```

**Run:**
```bash
node repl.js        # Interactive CLI
node app.js         # Web UI at http://localhost:3000
```

##  Usage

### REPL Commands
```
INSERT INTO tasks VALUES (1, 'Learn Databases', 1)
SELECT * FROM tasks
DELETE FROM tasks WHERE id = 1
SELECT * FROM tasks JOIN categories ON tasks.cat_id = categories.id
SCHEMA tasks
TABLES
```

### API (Node.js)
```javascript
const { BraisDB } = require('./engine.js');
const db = new BraisDB('tasks', { id: 'INTEGER', title: 'STRING' });

db.insert({ id: 1, title: 'Learn DB' });
db.findById(1);
db.update(1, { title: 'Master DB' });
db.delete(1);
```

### REST API
```bash
curl http://localhost:3000/api/tasks
curl -X POST http://localhost:3000/api/tasks -d '{"id":1,"title":"Test","category_id":1}'
curl -X PUT http://localhost:3000/api/tasks/1 -d '{"title":"Updated"}'
curl -X DELETE http://localhost:3000/api/tasks/1
curl http://localhost:3000/api/schema/tasks
```

##  Architecture

| Layer | Files | Purpose |
|-------|-------|---------|
| Storage | `engine.js` | Indexing, validation, persistence |
| Query | `parser.js` | Regex-based SQL parsing |
| Interface | `repl.js`, `app.js` | CLI and REST API |
| UI | `public/` | Web dashboard |

##  Quick Tests

See [docs/devdoc.md](docs/devdoc.md) for comprehensive testing guide.

**Basic test:**
```bash
node -e "
const { BraisDB } = require('./engine.js');
const db = new BraisDB('test', { id: 'INTEGER', name: 'STRING' });
db.insert({ id: 1, name: 'Alice' });
console.log('✓ INSERT works:', db.findById(1));
"
```

##  Key Implementation Details

- **Data Persistence**: JSON files in `/data` directory
- **Indexing**: In-memory hash map for O(1) PK lookups
- **Type System**: Automatic validation and casting on INSERT/UPDATE
- **Joins**: Column names prefixed with table names (e.g., `tasks.id`, `categories.id`)
- **Parser**: Regex-based SQL pattern matching

