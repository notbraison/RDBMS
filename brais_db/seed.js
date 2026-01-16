const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

// Initial data for Categories
const categories = [
    { id: 1, name: "Work" },
    { id: 2, name: "Personal" },
    { id: 3, name: "Urgent" }
];

// Initial data for Tasks (referencing category_id)
const tasks = [
    { id: 101, title: "Finish RDBMS Project", category_id: 1 },
    { id: 102, title: "Buy groceries", category_id: 2 },
    { id: 103, title: "Fix production bug", category_id: 3 },
    { id: 104, title: "Submit documentation", category_id: 1 }
];

function seed() {
    // 1. Create data directory if it doesn't exist
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR);
        console.log("Created /data directory.");
    }

    // 2. Write the "Tables"
    fs.writeFileSync(
        path.join(DATA_DIR, 'categories.json'), 
        JSON.stringify(categories, null, 2)
    );
    
    fs.writeFileSync(
        path.join(DATA_DIR, 'tasks.json'), 
        JSON.stringify(tasks, null, 2)
    );

    console.log("✅ Database seeded successfully!");
    console.log(`- Created 3 categories in categories.json`);
    console.log(`- Created 4 tasks in tasks.json`);
}

seed();