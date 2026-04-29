const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const path = require('path');

const db = new Database(path.join(__dirname, 'docvault.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        _id     TEXT PRIMARY KEY,
        name    TEXT NOT NULL,
        email   TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        createdAt TEXT DEFAULT (datetime('now')),
        updatedAt TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS documents (
        _id              TEXT PRIMARY KEY,
        name             TEXT NOT NULL,
        type             TEXT NOT NULL,
        expirationDate   TEXT,
        issuingAuthority TEXT,
        fileName         TEXT NOT NULL,
        fileType         TEXT NOT NULL,
        filePath         TEXT NOT NULL,
        user             TEXT NOT NULL,
        createdAt        TEXT DEFAULT (datetime('now')),
        updatedAt        TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user) REFERENCES users(_id)
    );
`);

const User = {
    async findOne({ email }) {
        return db.prepare('SELECT * FROM users WHERE email = ?').get(email) || null;
    },

    async findById(id) {
        return db.prepare('SELECT _id, name, email, createdAt, updatedAt FROM users WHERE _id = ?').get(id) || null;
    },

    async create({ name, email, password }) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        const _id = crypto.randomUUID();
        db.prepare('INSERT INTO users (_id, name, email, password) VALUES (?, ?, ?, ?)').run(_id, name, email, hashed);
        return { _id, name, email };
    }
};

const Document = {
    async find({ user }) {
        return db.prepare('SELECT * FROM documents WHERE user = ? ORDER BY createdAt DESC').all(user);
    },

    async findOne({ _id, user }) {
        if (user !== undefined) {
            return db.prepare('SELECT * FROM documents WHERE _id = ? AND user = ?').get(_id, user) || null;
        }
        return db.prepare('SELECT * FROM documents WHERE _id = ?').get(_id) || null;
    },

    async create({ name, type, expirationDate, issuingAuthority, fileName, fileType, filePath, user }) {
        const _id = crypto.randomUUID();
        const now = new Date().toISOString();
        db.prepare(`
            INSERT INTO documents (_id, name, type, expirationDate, issuingAuthority, fileName, fileType, filePath, user, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(_id, name, type, expirationDate || null, issuingAuthority || null, fileName, fileType, filePath, user, now, now);
        return Document.findOne({ _id });
    },

    async update(_id, userId, fields) {
        const now = new Date().toISOString();
        const allowed = ['name', 'type', 'expirationDate', 'issuingAuthority', 'fileName', 'fileType', 'filePath'];
        const cols = Object.keys(fields).filter(k => allowed.includes(k));
        const setClauses = [...cols.map(k => `${k} = ?`), 'updatedAt = ?'].join(', ');
        const values = [...cols.map(k => fields[k] ?? null), now];
        db.prepare(`UPDATE documents SET ${setClauses} WHERE _id = ? AND user = ?`).run(...values, _id, userId);
        return Document.findOne({ _id });
    },

    async deleteOne({ _id }) {
        db.prepare('DELETE FROM documents WHERE _id = ?').run(_id);
    }
};

console.log('SQLite database ready');

module.exports = { User, Document };
