const express = require('express');
const cors = require('cors'); // Importa cors
const db = require('./database');
const routes = require('./routes');

const app = express();

// Habilita CORS para todas las rutas
app.use(cors());

app.use(express.json()); // Para manejar JSON en las solicitudes
app.use('/api', routes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
