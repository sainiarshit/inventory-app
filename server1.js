// server.js
const express = require('express');
const cors = require('cors');
const app = express();

const productRoutes = require('./routes/routes/products');

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);

app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
