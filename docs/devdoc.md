# BraisDB - Developer Testing Guide

Quick reference for developers to test the RDBMS implementation.

##  Quick Start

cd brais_db
npm install express , node seed.js 
mkdir data

node repl.js , node app.js

### REPL Integration Tests

node repl.js
# Commands to test:

# INSERT INTO tasks VALUES (1, 'Test Task', 1)
# SELECT * FROM tasks
# SCHEMA tasks
# TABLES
# DELETE FROM tasks WHERE id = 1


##  Architecture Notes

- **Storage**: JSON files in `/data` directory
- **Schemas**: Persisted to `.schema.json` files
- **Index**: In-memory hash map for O(1) PK lookups
- **Parser**: Regex-based SQL pattern matching
- **Joins**: Nested loop algorithm with column prefixing

##  Files Overview

| File | Purpose |
|------|---------|
| `engine.js` | Core DB logic, indexing, type validation |
| `parser.js` | SQL regex patterns |
| `repl.js` | CLI interface, command parsing |
| `app.js` | Express REST API |
| `public/` | Web UI |
| `seed.js` | Test data initialization script |

##  Performance

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| findById | O(1) | Hash map lookup |
| selectAll | O(n) | Full scan |
| insert | O(1) | Index update |
| delete | O(n) | Index rebuild |
| join | O(n*m) | Nested loop |