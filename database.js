const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'passwords.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados SQLite:', err.message);
  } else {
    console.log('📦 Conectado ao banco de dados SQLite:', DB_PATH);
  }
});

// Inicialização da tabela de senhas capturadas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS captured_passwords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      password_value TEXT NOT NULL,
      strength_level TEXT NOT NULL,
      strength_score INTEGER NOT NULL,
      crack_time TEXT NOT NULL,
      user_ip TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela captured_passwords:', err.message);
    } else {
      console.log('✅ Tabela captured_passwords pronta para uso.');
    }
  });
});

/**
 * Salva a senha capturada e metadados no SQLite
 */
function saveCapturedPassword({ password, strengthLevel, score, crackTime, ip, userAgent }) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO captured_passwords (password_value, strength_level, strength_score, crack_time, user_ip, user_agent)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run([password, strengthLevel, score, crackTime, ip, userAgent], function (err) {
      if (err) {
        return reject(err);
      }
      resolve({ id: this.lastID });
    });
    stmt.finalize();
  });
}

/**
 * Recupera todos os registros de senhas capturadas
 */
function getAllCapturedPasswords() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM captured_passwords ORDER BY id DESC`, [], (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

/**
 * Limpa todos os registros do banco
 */
function clearAllCapturedPasswords() {
  return new Promise((resolve, reject) => {
    db.run(`DELETE FROM captured_passwords`, [], function (err) {
      if (err) {
        return reject(err);
      }
      resolve({ changes: this.changes });
    });
  });
}

module.exports = {
  db,
  saveCapturedPassword,
  getAllCapturedPasswords,
  clearAllCapturedPasswords
};
