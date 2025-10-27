// api/src/connection.ts
import Database from "better-sqlite3";
import path from "path";

// where the DB file lives
const dbPath = path.join(process.cwd(), "data.db");

// open or create the DB
const db = new Database(dbPath);

// create a basic table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS beacons (
    publicKey TEXT PRIMARY KEY,
    name TEXT,
    verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

export default db;