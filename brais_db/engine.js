const fs = require('fs');

// Type validation utilities
const TypeValidator = {
    validateType(value, type) {
        if (value === null || value === undefined) return true; // Allow nulls
        
        switch (type.toUpperCase()) {
            case 'STRING':
            case 'TEXT':
                return typeof value === 'string';
            case 'INT':
            case 'INTEGER':
                return Number.isInteger(value);
            case 'FLOAT':
            case 'DOUBLE':
                return typeof value === 'number';
            case 'BOOLEAN':
                return typeof value === 'boolean';
            case 'DATE':
                return !isNaN(Date.parse(value));
            case 'JSON':
                return typeof value === 'object';
            default:
                return true; // Allow unknown types
        }
    },
    
    castValue(value, type) {
        switch (type.toUpperCase()) {
            case 'INT':
            case 'INTEGER':
                return parseInt(value);
            case 'FLOAT':
            case 'DOUBLE':
                return parseFloat(value);
            case 'BOOLEAN':
                return value === true || value === 'true' || value === 1 || value === '1';
            case 'STRING':
            case 'TEXT':
                return String(value);
            case 'DATE':
                return new Date(value).toISOString();
            default:
                return value;
        }
    }
};

class BraisDB {
    constructor(tableName, schema = {}) {
        this.tableName = tableName;
        this.filePath = `./data/${tableName}.json`;
        this.schemaPath = `./data/${tableName}.schema.json`;
        this.data = this.loadData();
        this.schema = this.loadSchema(schema);
        
        // --- INDEXING ---
        // We use a Map for O(1) lookups of Primary Keys
        this.primaryIndex = {};
        this.buildIndex();
    }

    loadSchema(defaultSchema) {
        if (fs.existsSync(this.schemaPath)) {
            try {
                return JSON.parse(fs.readFileSync(this.schemaPath));
            } catch (e) {
                return defaultSchema;
            }
        }
        return defaultSchema;
    }

    saveSchema() {
        fs.writeFileSync(this.schemaPath, JSON.stringify(this.schema, null, 2));
    }

    // Define schema for a table
    defineSchema(columnDefinitions) {
        this.schema = columnDefinitions;
        this.saveSchema();
    }

    // Validate a record against the schema
    validateRecord(record) {
        if (Object.keys(this.schema).length === 0) return true; // No schema defined
        
        for (const [column, type] of Object.entries(this.schema)) {
            if (record[column] !== undefined && record[column] !== null) {
                if (!TypeValidator.validateType(record[column], type)) {
                    throw new Error(`Type mismatch for column '${column}': expected ${type}, got ${typeof record[column]}`);
                }
            }
        }
        return true;
    }

    // Cast record values to proper types
    castRecord(record) {
        if (Object.keys(this.schema).length === 0) return record;
        
        const casted = { ...record };
        for (const [column, type] of Object.entries(this.schema)) {
            if (casted[column] !== undefined && casted[column] !== null) {
                casted[column] = TypeValidator.castValue(casted[column], type);
            }
        }
        return casted;
    }

    loadData() {
        if (!fs.existsSync(this.filePath)) return [];
        try {
            return JSON.parse(fs.readFileSync(this.filePath));
        } catch (e) {
            return [];
        }
    }

    // Builds the index from existing data
    buildIndex() {
        this.primaryIndex = {};
        this.data.forEach((record, index) => {
            if (record.id) {
                this.primaryIndex[record.id] = index;
            }
        });
    }

    // READ operation using the Index
    findById(id) {
        const dataIndex = this.primaryIndex[id];
        if (dataIndex === undefined) return null;
        return this.data[dataIndex];
    }

    // CREATE operation
    insert(record) {
        // Validate and cast record against schema
        this.validateRecord(record);
        const casted = this.castRecord(record);
        
        // ⚡ Index Check: Much faster than this.data.find()
        if (this.primaryIndex[casted.id] !== undefined) {
            throw new Error(`Primary Key Constraint Violated: ID ${casted.id} already exists.`);
        }

        this.data.push(casted);
        
        // Update the index with the new record's position
        this.primaryIndex[casted.id] = this.data.length - 1;
        
        this.save();
    }

    save() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    }

    selectAll() {
    return this.data;
}

// DELETE using the index for O(1) lookup
delete(id) {
    const indexInArray = this.primaryIndex[id];
    if (indexInArray === undefined) throw new Error("Record not found.");

    // Remove from data array
    this.data.splice(indexInArray, 1);
    
    // ⚡ Re-build index because array positions have shifted
    this.buildIndex(); 
    this.save();
}

// UPDATE using the index
update(id, newData) {
    const indexInArray = this.primaryIndex[id];
    if (indexInArray === undefined) throw new Error("Record not found.");
    
    // Validate and cast new data
    this.validateRecord(newData);
    const casted = this.castRecord(newData);

    // Merge old data with new data
    this.data[indexInArray] = { ...this.data[indexInArray], ...casted };
    
    // If the ID changed (rare for PK), we'd rebuild, but usually PK is static
    this.save();
}

    // JOIN operation (Keeping your merged logic)
    static executeJoin(tableA, tableB, tableA_Name, tableB_Name, columnA, columnB) {
        const result = [];
        tableA.forEach(rowA => {
            tableB.forEach(rowB => {
                if (rowA[columnA] === rowB[columnB]) {
                    const mergedRow = {};
                    Object.keys(rowA).forEach(k => mergedRow[`${tableA_Name}.${k}`] = rowA[k]);
                    Object.keys(rowB).forEach(k => mergedRow[`${tableB_Name}.${k}`] = rowB[k]);
                    result.push(mergedRow);
                }
            });
        });
        return result;
    }

    // Get schema information
    getSchemaInfo() {
        return this.schema;
    }

    // Get table info (name, column count, row count, schema)
    getTableInfo() {
        return {
            name: this.tableName,
            rows: this.data.length,
            columns: Object.keys(this.schema).length,
            schema: this.schema
        };
    }
}

module.exports = { BraisDB, TypeValidator };