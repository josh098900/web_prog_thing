import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
// Explicitly allow Vite frontend origin
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Initialize SQLite database
const dbPath = join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        // Create Past Journeys Table
        db.run(`CREATE TABLE IF NOT EXISTS past_journeys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT,
            origin TEXT,
            destination TEXT,
            aircraft TEXT,
            status TEXT
        )`);

        // Create Catering Menu Table
        db.run(`CREATE TABLE IF NOT EXISTS catering_menu (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            item_name TEXT,
            description TEXT,
            price TEXT
        )`);

        // Seed data if empty
        db.get("SELECT COUNT(*) as count FROM past_journeys", (err, row) => {
            if (row.count === 0) {
                console.log('Seeding past_journeys...');
                const stmt = db.prepare("INSERT INTO past_journeys (date, origin, destination, aircraft, status) VALUES (?, ?, ?, ?, ?)");
                stmt.run("2024-11-15", "JFK", "LHR", "Bombardier Global 7500", "Completed");
                stmt.run("2024-12-02", "DXB", "CDG", "Gulfstream G650", "Completed");
                stmt.run("2025-01-20", "LAX", "HND", "Dassault Falcon 8X", "Completed");
                stmt.finalize();
            }
        });

        db.get("SELECT COUNT(*) as count FROM catering_menu", (err, row) => {
            if (row.count === 0) {
                console.log('Seeding catering_menu...');
                const stmt = db.prepare("INSERT INTO catering_menu (category, item_name, description, price) VALUES (?, ?, ?, ?)");
                stmt.run("Caviar", "Beluga Reserve (50g)", "Sourced from the Caspian Sea, served with mother-of-pearl spoons.", "Included");
                stmt.run("Caviar", "Imperial Ossetra (50g)", "Nutty flavor profile with firm, golden-brown pearls.", "Included");
                stmt.run("Champagne", "Dom Pérignon Vintage 2012", "Luminous, vibrant, and perfectly balanced.", "Included");
                stmt.run("Champagne", "Krug Grande Cuvée", "A masterpiece of blending, offering exceptional richness.", "Included");
                stmt.run("Hot Dining", "Wagyu Filet Mignon", "Grade A5, served with truffle mash and seasonal asparagus.", "$150 surcharge");
                stmt.run("Hot Dining", "Miso Glazed Black Cod", "Sustainably caught, served over jasmine rice.", "Included");
                stmt.finalize();
            }
        });
    });
}

// REST Endpoints
app.get('/api/history', (req, res) => {
    db.all("SELECT * FROM past_journeys ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

app.get('/api/menu', (req, res) => {
    db.all("SELECT * FROM catering_menu", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

app.listen(PORT, () => {
    console.log(`Jesko Jets API Server running on http://localhost:${PORT}`);
});
