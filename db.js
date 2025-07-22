// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // default in XAMPP
  database: 'varsha_collection'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL Connection Error:', err);
    return;
  }
  console.log('✅ MySQL Connected to varsha_collection');
});

module.exports = db;
