const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function wipeAndInit() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
    };

    let connection;
    try {
        console.log('Connecting to MySQL...');
        connection = await mysql.createConnection(config);

        const dbName = process.env.DB_NAME || 'husa_basketball';
        
        console.log(`Dropping database ${dbName} if exists...`);
        await connection.query(`DROP DATABASE IF EXISTS ${dbName}`);
        
        console.log(`Creating database ${dbName}...`);
        await connection.query(`CREATE DATABASE ${dbName}`);
        
        console.log(`Using database ${dbName}...`);
        await connection.query(`USE ${dbName}`);

        const schemaPath = path.join(__dirname, '../../database/schema.sql');
        console.log(`Reading schema from ${schemaPath}...`);
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split schema into individual queries
        const queries = schema
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0 && !q.startsWith('--'));

        console.log(`Executing ${queries.length} queries from schema.sql...`);
        for (let query of queries) {
            try {
                // If query starts with USE or CREATE DATABASE, we already handled it, but let's be safe
                if (query.toUpperCase().startsWith('CREATE DATABASE') || query.toUpperCase().startsWith('USE')) {
                    continue;
                }
                await connection.query(query);
            } catch (err) {
                console.error(`Error executing query: ${query.substring(0, 50)}...`);
                console.error(err.message);
            }
        }

        console.log('Database re-initialization complete.');

    } catch (err) {
        console.error('Failed to wipe and init database:', err);
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
}

wipeAndInit();
