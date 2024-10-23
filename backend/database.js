const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Especifica la ruta del archivo de la base de datos
const dbPath = path.resolve(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Crear la tabla de libros si no existe
  db.run(`CREATE TABLE IF NOT EXISTS books (
    isbn13 INTEGER PRIMARY KEY,
    titulo TEXT,
    autor TEXT,
    editorial TEXT,
    sello TEXT,
    coleccion TEXT,
    texto_bic_materia TEXT,
    texto_bic_materia_destacada TEXT
  )`);

  // Crear la tabla de ventas si no existe
  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    isbn13 INTEGER,
    fechaventa TEXT,
    numerodeventas INTEGER,
    FOREIGN KEY (isbn13) REFERENCES books(isbn13)
  )`);
});

module.exports = db;
