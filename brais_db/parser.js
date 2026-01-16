function parseCommand(input) {
    const command = input.trim();

    // 1. Match INSERT INTO table VALUES (val1, val2)
    const insertMatch = command.match(/INSERT INTO (\w+) VALUES \((.+)\)/i);
    if (insertMatch) {
        return {
            type: 'INSERT',
            table: insertMatch[1],
            values: insertMatch[2].split(',').map(v => v.trim().replace(/'/g, ""))
        };
    }

    // 2. Match SELECT * FROM table WHERE col = val
    const selectMatch = command.match(/SELECT (.+) FROM (\w+)(?: WHERE (.+))?/i);
    if (selectMatch) {
        return {
            type: 'SELECT',
            columns: selectMatch[1],
            table: selectMatch[2],
            where: selectMatch[3] ? selectMatch[3].split('=') : null
        };
    }

    const updateMatch = command.match(/UPDATE (\w+) SET (.+) WHERE (.+)/i);
    if (updateMatch) {
        return {
            type: 'UPDATE',
            table: updateMatch[1],
            set: updateMatch[2],
            where: updateMatch[3]
        };
    }

    const deleteMatch = command.match(/DELETE FROM (\w+) WHERE (.+)/i);
    if (deleteMatch) {
        return {
            type: 'DELETE',
            table: deleteMatch[1],
            where: deleteMatch[2]
        };
    }   

    // 3. Match SELECT cols FROM tableA JOIN tableB ON tableA.col = tableB.col
    const joinMatch = command.match(/SELECT (.+) FROM (\w+) JOIN (\w+) ON (\w+)\.(\w+) = (\w+)\.(\w+)/i);
    if (joinMatch) {
        return {
            type: 'SELECT_JOIN',
            columns: joinMatch[1].split(',').map(c => c.trim()),
            leftTable: joinMatch[2],
            rightTable: joinMatch[3],
            leftCol: joinMatch[5],
            rightCol: joinMatch[7]
        };
    }   


    return null;
}