const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'adi',
  password: '1This_is_a_very_strong_password',
  database: 'my_db',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL server');
});

module.exports=connection;