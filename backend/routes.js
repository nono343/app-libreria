const express = require('express');
const router = express.Router();
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const db = require('./database');

// Configuración de multer para manejar la carga de archivos
const upload = multer({ dest: 'uploads/' }); // Carpeta temporal para almacenar el archivo

// Función para convertir la fecha de DD/MM/YY a YYYY-MM-DD
function convertDate(dateStr) {
    const [day, month, year] = dateStr.split('/');
    return `20${year}-${month}-${day}`; // Se asume que el año tiene 2 dígitos (por ejemplo, '24' -> '2024')
  }

  
// Ruta para cargar el archivo CSV
router.post('/upload-csv', upload.single('file'), (req, res) => {
    const filePath = req.file.path;

    console.log('Archivo recibido:', req.file);  // Verifica si el archivo fue recibido correctamente

    // Verifica si el archivo fue subido correctamente
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    fs.createReadStream(filePath)
        .pipe(csvParser({ separator: ';' }))
        .on('data', (data) => {
            console.log('Fila procesada:', data);  // Ver cada fila procesada del CSV
            results.push(data);
        })
        .on('end', () => {
            try {
                const insert = db.prepare(`
            INSERT INTO books (isbn13, titulo, autor, editorial, sello, coleccion, texto_bic_materia, texto_bic_materia_destacada)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(isbn13) DO NOTHING
          `);

                results.forEach(row => {
                    console.log('Insertando fila:', row);  // Verifica los datos antes de la inserción
                    insert.run(
                        parseInt(row.isbn13, 10),  // Asegúrate de que `isbn13` sea numérico
                        row.titulo,
                        row.autor,
                        row.editorial,
                        row.sello,
                        row.coleccion,
                        row.texto_bic_materia,
                        row.texto_bic_materia_destacada
                    );
                });

                insert.finalize();
                res.json({ message: 'Archivo CSV procesado y datos insertados correctamente' });
            } catch (error) {
                console.error('Error processing CSV file:', error);
                res.status(500).json({ message: 'Error processing CSV file' });
            } finally {
                fs.unlinkSync(filePath); // Eliminar el archivo temporal
            }
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
            res.status(500).json({ message: 'Error reading CSV file' });
        });
});


// Ruta para cargar el archivo CSV de ventas
router.post('/upload-sales-csv', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
  
    // Verifica si el archivo fue subido correctamente
    if (!req.file) {
      console.log('No se subió ningún archivo');
      return res.status(400).json({ message: 'No file uploaded' });
    }
  
    console.log('Archivo de ventas recibido:', req.file);
  
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser({ separator: ';' })) // Asegúrate de que el separador esté configurado como ';'
      .on('data', (data) => {
        console.log('Fila procesada:', data);  // Para depuración
        results.push(data);
      })
      .on('end', () => {
        try {
          const insert = db.prepare(`
            INSERT INTO sales (isbn13, fechaventa, numerodeventas)
            VALUES (?, ?, ?)
          `);
  
          results.forEach(row => {
            const convertedDate = convertDate(row.fechaventa); // Convertir la fecha antes de insertar
            console.log('Insertando venta con fecha convertida:', convertedDate);
            insert.run(
              parseInt(row.isbn13, 10),  // Asegúrate de que `isbn13` se inserte como número
              convertedDate,
              parseInt(row.numerodeventas, 10)  // Convertir a número entero
            );
          });
  
          insert.finalize();
          res.json({ message: 'Archivo CSV de ventas procesado y datos insertados correctamente' });
        } catch (error) {
          console.error('Error processing sales CSV file:', error);
          res.status(500).json({ message: 'Error processing sales CSV file' });
        } finally {
          fs.unlinkSync(filePath); // Eliminar el archivo temporal
        }
      })
      .on('error', (error) => {
        console.error('Error reading sales CSV file:', error);
        res.status(500).json({ message: 'Error reading sales CSV file' });
      });
  });
    
// Ruta para obtener todos los libros
router.get('/books', (req, res) => {
    db.all("SELECT * FROM books", [], (err, rows) => {
        if (err) {
            console.error('Error fetching books:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ books: rows });
    });
});

// Ruta para obtener todas las ventas de un libro por isbn13
router.get('/books/:isbn13/sales', (req, res) => {
    const isbn13 = parseInt(req.params.isbn13, 10);

    db.all("SELECT * FROM sales WHERE isbn13 = ?", [isbn13], (err, rows) => {
        if (err) {
            console.error('Error fetching sales:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ sales: rows });
    });
});

// Ruta para obtener las ventas de libros agrupadas por semana
router.get('/salesbook/weekly', (req, res) => {
    db.all(`
      SELECT isbn13, strftime('%Y-%W', fechaventa) as week, SUM(numerodeventas) as total_sales
      FROM sales
      GROUP BY isbn13, week
    `, [], (err, rows) => {
      if (err) {
        console.error('Error fetching weekly sales:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ weekly_sales: rows });
    });
  });
  
  // Ruta para obtener las ventas de libros agrupadas por mes
  router.get('/salesbook/monthly', (req, res) => {
    db.all(`
      SELECT isbn13, strftime('%Y-%m', fechaventa) as month, SUM(numerodeventas) as total_sales
      FROM sales
      GROUP BY isbn13, month
    `, [], (err, rows) => {
      if (err) {
        console.error('Error fetching monthly sales:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ monthly_sales: rows });
    });
  });
  
  // Ruta para obtener las ventas de libros agrupadas por año
  router.get('/salesbook/yearly', (req, res) => {
    db.all(`
      SELECT isbn13, strftime('%Y', fechaventa) as year, SUM(numerodeventas) as total_sales
      FROM sales
      GROUP BY isbn13, year
    `, [], (err, rows) => {
      if (err) {
        console.error('Error fetching yearly sales:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ yearly_sales: rows });
    });
  });
      


// Ruta para el top 50 ventas semanales
router.get('/salesbook/weekly/top50', (req, res) => {
    db.all(`
      SELECT books.isbn13, books.titulo, SUM(sales.numerodeventas) as total_sales
      FROM sales
      JOIN books ON sales.isbn13 = books.isbn13
      GROUP BY books.isbn13, books.titulo
      ORDER BY total_sales DESC
      LIMIT 50
    `, [], (err, rows) => {
      if (err) {
        console.error('Error fetching top weekly sales:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ top_sales: rows });
    });
  });
    
  // Ruta para el top 50 ventas mensuales
  router.get('/salesbook/monthly/top50', (req, res) => {
    db.all(`
      SELECT books.isbn13, books.titulo, SUM(sales.numerodeventas) as total_sales
      FROM sales
      JOIN books ON sales.isbn13 = books.isbn13
      GROUP BY books.isbn13, books.titulo
      ORDER BY total_sales DESC
      LIMIT 50
    `, [], (err, rows) => {
      if (err) {
        console.error('Error fetching top monthly sales:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ top_sales: rows });
    });
  });
    
  // Ruta para el top 50 ventas anuales
  router.get('/salesbook/yearly/top50', (req, res) => {
    db.all(`
      SELECT books.isbn13, books.titulo, SUM(sales.numerodeventas) as total_sales
      FROM sales
      JOIN books ON sales.isbn13 = books.isbn13
      GROUP BY books.isbn13, books.titulo
      ORDER BY total_sales DESC
      LIMIT 50
    `, [], (err, rows) => {
      if (err) {
        console.error('Error fetching top yearly sales:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ top_sales: rows });
    });
  });
    

  // Ruta para comparar ventas semanales de libros por isbn

  router.get('/salesbook/weekly/comparison', (req, res) => {
    db.all(`
      SELECT books.isbn13, books.titulo,
             strftime('%Y-%W', sales.fechaventa) as week,
             strftime('%Y', sales.fechaventa) as year,
             SUM(sales.numerodeventas) as total_sales
      FROM sales
      JOIN books ON sales.isbn13 = books.isbn13
      WHERE strftime('%Y', sales.fechaventa) = strftime('%Y', 'now')
         OR strftime('%Y', sales.fechaventa) = strftime('%Y', 'now', '-1 year')
      GROUP BY books.isbn13, week, year
      ORDER BY week ASC
    `, [], (err, rows) => {
      if (err) {
        console.error('Error fetching weekly sales comparison:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ weekly_comparison: rows });
    });
  });


  // Ruta para comparar ventas mensuales de libros por isbn


  router.get('/salesbook/monthly/comparison', (req, res) => {
    db.all(`
      SELECT books.isbn13, books.titulo,
             strftime('%Y-%m', sales.fechaventa) as month,
             strftime('%Y', sales.fechaventa) as year,
             SUM(sales.numerodeventas) as total_sales
      FROM sales
      JOIN books ON sales.isbn13 = books.isbn13
      WHERE strftime('%Y', sales.fechaventa) = strftime('%Y', 'now')
         OR strftime('%Y', sales.fechaventa) = strftime('%Y', 'now', '-1 year')
      GROUP BY books.isbn13, month, year
      ORDER BY month ASC
    `, [], (err, rows) => {
      if (err) {
        console.error('Error fetching monthly sales comparison:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ monthly_comparison: rows });
    });
  });
  
    // Ruta para comparar ventas anuales de libros por isbn

  router.get('/salesbook/yearly/comparison', (req, res) => {
    db.all(`
      SELECT books.isbn13, books.titulo,
             strftime('%Y', sales.fechaventa) as year,
             SUM(sales.numerodeventas) as total_sales
      FROM sales
      JOIN books ON sales.isbn13 = books.isbn13
      WHERE strftime('%Y', sales.fechaventa) = strftime('%Y', 'now')
         OR strftime('%Y', sales.fechaventa) = strftime('%Y', 'now', '-1 year')
      GROUP BY books.isbn13, year
      ORDER BY year ASC
    `, [], (err, rows) => {
      if (err) {
        console.error('Error fetching yearly sales comparison:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ yearly_comparison: rows });
    });
  });
  

  // Ruta para comparar ventas semanales de editorial


  router.get('/saleseditorial/weekly/comparison', (req, res) => {
    db.all(`
      SELECT books.editorial, 
             strftime('%Y-%W', sales.fechaventa) as week,
             strftime('%Y', sales.fechaventa) as year,
             SUM(sales.numerodeventas) as total_sales
      FROM sales
      JOIN books ON sales.isbn13 = books.isbn13
      WHERE strftime('%Y', sales.fechaventa) = strftime('%Y', 'now')
         OR strftime('%Y', sales.fechaventa) = strftime('%Y', 'now', '-1 year')
      GROUP BY books.editorial, week, year
      ORDER BY week ASC
    `, [], (err, rows) => {
      if (err) {
        console.error('Error fetching weekly sales comparison by editorial:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ weekly_comparison: rows });
    });
  });
  
  // Ruta para comparar ventas mensuales de editorial

  router.get('/saleseditorial/monthly/comparison', (req, res) => {
    db.all(`
      SELECT books.editorial, 
             strftime('%Y-%m', sales.fechaventa) as month,
             strftime('%Y', sales.fechaventa) as year,
             SUM(sales.numerodeventas) as total_sales
      FROM sales
      JOIN books ON sales.isbn13 = books.isbn13
      WHERE strftime('%Y', sales.fechaventa) = strftime('%Y', 'now')
         OR strftime('%Y', sales.fechaventa) = strftime('%Y', 'now', '-1 year')
      GROUP BY books.editorial, month, year
      ORDER BY month ASC
    `, [], (err, rows) => {
      if (err) {
        console.error('Error fetching monthly sales comparison by editorial:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ monthly_comparison: rows });
    });
  });
  
  // Ruta para comparar ventas anuales de editorial


  router.get('/saleseditorial/yearly/comparison', (req, res) => {
    db.all(`
      SELECT books.editorial, 
             strftime('%Y', sales.fechaventa) as year,
             SUM(sales.numerodeventas) as total_sales
      FROM sales
      JOIN books ON sales.isbn13 = books.isbn13
      WHERE strftime('%Y', sales.fechaventa) = strftime('%Y', 'now')
         OR strftime('%Y', sales.fechaventa) = strftime('%Y', 'now', '-1 year')
      GROUP BY books.editorial, year
      ORDER BY year ASC
    `, [], (err, rows) => {
      if (err) {
        console.error('Error fetching yearly sales comparison by editorial:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ yearly_comparison: rows });
    });
  });
  

// Ruta para obtener la comparación semanal de ventas por autor
router.get('/salesauthor/weekly/comparison', (req, res) => {
    const query = `
      SELECT autor, strftime('%Y-%W', fechaventa) as week, strftime('%Y', fechaventa) as year, SUM(numerodeventas) as total_sales
      FROM sales
      JOIN books ON sales.isbn13 = books.isbn13
      GROUP BY autor, week, year
    `;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching weekly sales comparison:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ weekly_comparison: rows });
    });
  });
  
  // Ruta para obtener la comparación mensual de ventas por autor
  router.get('/salesauthor/monthly/comparison', (req, res) => {
    const query = `
      SELECT autor, strftime('%Y-%m', fechaventa) as month, strftime('%Y', fechaventa) as year, SUM(numerodeventas) as total_sales
      FROM sales
      JOIN books ON sales.isbn13 = books.isbn13
      GROUP BY autor, month, year
    `;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching monthly sales comparison:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ monthly_comparison: rows });
    });
  });
  
  // Ruta para obtener la comparación anual de ventas por autor
  router.get('/salesauthor/yearly/comparison', (req, res) => {
    const query = `
      SELECT autor, strftime('%Y', fechaventa) as year, SUM(numerodeventas) as total_sales
      FROM sales
      JOIN books ON sales.isbn13 = books.isbn13
      GROUP BY autor, year
    `;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error fetching yearly sales comparison:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ yearly_comparison: rows });
    });
  });
  

module.exports = router;


