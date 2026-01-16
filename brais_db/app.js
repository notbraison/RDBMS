const express = require('express');
const { BraisDB } = require('./engine.js');

const app = express();
app.use(express.json()); // To handle JSON data from the frontend
app.use(express.static('public')); // To serve your HTML/CSS/JS

// Initialize your custom DB tables with schemas
const tasksDB = new BraisDB('tasks', {
    id: 'INTEGER',
    title: 'STRING',
    category_id: 'INTEGER'
});

const categoriesDB = new BraisDB('categories', {
    id: 'INTEGER',
    name: 'STRING'
});

// 1. READ (Select all tasks)
app.get('/api/tasks', (req, res) => {
    try {
        const data = tasksDB.selectAll();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. CREATE (Insert a task)
app.post('/api/tasks', (req, res) => {
    try {
        const { id, title, category_id } = req.body;
        tasksDB.insert({ id, title, category_id });
        res.status(201).json({ status: "Success" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. UPDATE (Update a task)
app.put('/api/tasks/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { title } = req.body;
        
        const taskIndex = tasksDB.data.findIndex(t => t.id === id);
        if (taskIndex === -1) {
            return res.status(404).json({ error: "Task not found" });
        }
        
        tasksDB.data[taskIndex].title = title;
        tasksDB.save();
        res.json({ status: "Task updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. DELETE (Delete a task)
app.delete('/api/tasks/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        
        const taskIndex = tasksDB.data.findIndex(t => t.id === id);
        if (taskIndex === -1) {
            return res.status(404).json({ error: "Task not found" });
        }
        
        tasksDB.data.splice(taskIndex, 1);
        tasksDB.save();
        res.json({ status: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. GET SCHEMA (Get table schema information)
app.get('/api/schema/:table', (req, res) => {
    try {
        const table = req.params.table.toLowerCase();
        let db = null;
        
        if (table === 'tasks') db = tasksDB;
        else if (table === 'categories') db = categoriesDB;
        else {
            return res.status(404).json({ error: "Table not found" });
        }
        
        res.json({
            table: table,
            schema: db.getSchemaInfo(),
            info: db.getTableInfo()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Web App running at http://localhost:${PORT}`));