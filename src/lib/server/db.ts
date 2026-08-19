import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const dbPath = join(process.cwd(), 'cartshare.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS Lists (
        id TEXT PRIMARY KEY,
        edit_token TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS Items (
        id TEXT PRIMARY KEY,
        list_id TEXT NOT NULL,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        image_url TEXT,
        price TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(list_id) REFERENCES Lists(id) ON DELETE CASCADE
    );
`);
