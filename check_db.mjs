import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) { console.log('No DATABASE_URL'); process.exit(1); }

const conn = await mysql.createConnection(url);
try {
  const [cols] = await conn.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='customers' ORDER BY ORDINAL_POSITION");
  console.log("Customers columns:", cols.map(r => r.COLUMN_NAME).join(', '));
  
  const [migs] = await conn.execute("SELECT name FROM `__drizzle_migrations` ORDER BY created_at").catch(() => [[{name:'(no migration table)'}]]);
  console.log("Applied migrations:", migs.map(r => r.name).join(', '));
} catch(e) {
  console.log("Error:", e.message);
}
await conn.end();
