const { BraisDB } = require('./engine.js'); // FIXED: Import added
const readline = require('readline');

// Initialize tables with schemas
const tables = {
    tasks: new BraisDB('tasks', {
        id: 'INTEGER',
        title: 'STRING',
        category_id: 'INTEGER'
    }),
    categories: new BraisDB('categories', {
        id: 'INTEGER',
        name: 'STRING'
    })
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'BRAIS_DB> '
});

function parseCommand(input) {
    const command = input.trim();
    
    // INSERT INTO table VALUES (val1, val2)
    const insertMatch = command.match(/INSERT INTO (\w+) VALUES \((.+)\)/i);
    if (insertMatch) {
        return {
            type: 'INSERT',
            table: insertMatch[1].toLowerCase(),
            values: insertMatch[2].split(',').map(v => v.trim().replace(/'/g, ""))
        };
    }
    
    // SELECT * FROM table [WHERE col = val]
    const selectMatch = command.match(/SELECT (.+) FROM (\w+)(?: WHERE (.+))?/i);
    if (selectMatch) {
        return {
            type: 'SELECT',
            columns: selectMatch[1],
            table: selectMatch[2].toLowerCase(),
            where: selectMatch[3] ? selectMatch[3].split('=') : null
        };
    }
    
    // DELETE FROM table WHERE col = val
    const deleteMatch = command.match(/DELETE FROM (\w+) WHERE (.+)/i);
    if (deleteMatch) {
        return {
            type: 'DELETE',
            table: deleteMatch[1].toLowerCase(),
            where: deleteMatch[2]
        };
    }
    
    // SELECT cols FROM tableA JOIN tableB ON tableA.col = tableB.col
    const joinMatch = command.match(/SELECT (.+) FROM (\w+) JOIN (\w+) ON (\w+)\.(\w+) = (\w+)\.(\w+)/i);
    if (joinMatch) {
        return {
            type: 'SELECT_JOIN',
            columns: joinMatch[1].split(',').map(c => c.trim()),
            leftTable: joinMatch[2].toLowerCase(),
            rightTable: joinMatch[3].toLowerCase(),
            leftCol: joinMatch[5],
            rightCol: joinMatch[7]
        };
    }

    // SCHEMA (Show table schema)
    const schemaMatch = command.match(/SCHEMA (\w+)/i);
    if (schemaMatch) {
        return {
            type: 'SCHEMA',
            table: schemaMatch[1].toLowerCase()
        };
    }

    // TABLES (Show all tables)
    if (/^TABLES$/i.test(command)) {
        return { type: 'TABLES' };
    }

    // HELP (Show commands)
    if (/^HELP$/i.test(command)) {
        return { type: 'HELP' };
    }
    
    return null;
}

// Helper to map values to column names from schema
function mapValuesToRecord(table, values) {
    const schema = tables[table].getSchemaInfo();
    const columns = Object.keys(schema);
    const record = {};
    
    values.forEach((val, idx) => {
        if (idx < columns.length) {
            record[columns[idx]] = val;
        }
    });
    
    return record;
}

rl.prompt();

rl.on('line', (line) => {
    try {
        const query = parseCommand(line);
        if (!query) return console.log("Syntax Error.");

        const db = tables[query.table];

        switch (query.type) {
            case 'INSERT':
                const record = mapValuesToRecord(query.table, query.values);
                db.insert(record);
                console.log("✓ Row inserted.");
                break;
            case 'SELECT':
                const results = query.where 
                    ? [db.findById(query.where[1].trim())] 
                    : db.selectAll();
                console.table(results);
                break;
            case 'DELETE':
                const idToDelete = query.where.split('=')[1].trim();
                db.delete(idToDelete);
                console.log("✓ Row deleted.");
                break;
            case 'SELECT_JOIN':
                const joined = BraisDB.executeJoin(
                    tables[query.leftTable].data,
                    tables[query.rightTable].data,
                    query.leftTable, query.rightTable,
                    query.leftCol, query.rightCol
                );
                console.table(joined);
                break;
            case 'SCHEMA':
                const schema = db.getTableInfo();
                console.log(`\n📋 Table: ${schema.name}`);
                console.log(`Rows: ${schema.rows} | Columns: ${schema.columns}`);
                console.log('Schema:');
                console.table(schema.schema);
                break;
            case 'TABLES':
                console.log('\n📊 Available Tables:');
                Object.keys(tables).forEach(tableName => {
                    const info = tables[tableName].getTableInfo();
                    console.log(`  - ${info.name}: ${info.rows} rows, ${info.columns} columns`);
                });
                break;
            case 'HELP':
                console.log(`\n📖 Available Commands:\n
  INSERT INTO table VALUES (val1, val2, ...)
  SELECT * FROM table [WHERE col = val]
  DELETE FROM table WHERE col = val
  SELECT * FROM tableA JOIN tableB ON tableA.col = tableB.col
  SCHEMA table
  TABLES
  HELP
                `);
                break;
                break;
        }
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
    rl.prompt();
});