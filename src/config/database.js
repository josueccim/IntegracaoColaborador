const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseConfig {
    constructor() {
        this.dbPath = path.join(__dirname, '../../database/paytrack.db');
        this.db = null;
    }

    async connect() {

        return new Promise((resolve, reject) => {

            this.db = new sqlite3.Database(this.dbPath, (err) => {

                if (err) {
                    reject(err);
                } else {
                    console.log('Conectado ao banco SQLite');
                    resolve(this.db);
                }

            });
        });
    }

    async createTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS empresas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cnpj VARCHAR(14) UNIQUE NOT NULL,
                nome VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS centros_custo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                identificador VARCHAR(100) UNIQUE NOT NULL,
                nome VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS colaboradores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cpf VARCHAR(11) UNIQUE NOT NULL,
                usuario VARCHAR(255) NOT NULL,
                nome VARCHAR(255) NOT NULL,
                sobrenome VARCHAR(255) NOT NULL,
                cargo VARCHAR(255),
                matricula VARCHAR(50),
                empresa_id INTEGER NOT NULL,
                centro_custo_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (empresa_id) REFERENCES empresas(id),
                FOREIGN KEY (centro_custo_id) REFERENCES centros_custo(id)
            )`
        ];

        for (const table of tables) {
            await this.run(table);
        }
    }

    async run(sql, params = []) {
        
        return new Promise((resolve, reject) => {
        
            this.db.run(sql, params, function(err) {
                
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }

            });
        });
    }

    async get(sql, params = []) {

        return new Promise((resolve, reject) => {

            this.db.get(sql, params, (err, row) => {

                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }

            });
        });
    }

    async all(sql, params = []) {

        return new Promise((resolve, reject) => {

            this.db.all(sql, params, (err, rows) => {

                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }

            });
        });
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }

}

module.exports = DatabaseConfig;