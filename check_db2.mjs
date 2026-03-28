import mysql from 'mysql2/promise';
const url = process.env.DATABASE_URL;
const conn = await mysql.createConnection(url);
const [tables] = await conn.execute("SHOW TABLES");
console.log("Tables:", tables.map(r => Object.values(r)[0]).join(', '));
const [cols] = await conn.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='customers' ORDER BY ORDINAL_POSITION");
console.log("Customers columns:", cols.map(r => r.COLUMN_NAME).join(', '));
await conn.end();
