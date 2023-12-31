const express = require('express');
const router = express.Router();
const db = require('../db/db');
const tableName='tabl1';
router.get('/getData', (req, res) => {
  db.query('SELECT * FROM '+tableName, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
    
  });
});

router.get('/getColumnNames', (req, res) => {
  // const tableName = 'table1'; // Replace with your actual table name

  // Query to get column names for the specified table
  const query = `SELECT * FROM ` +tableName+ ` LIMIT 1;`;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

function validateInsertData(req){
  return true;
}
router.post('/insertData', (req, res) => {
  const { ...columns } = req.body;
  // Check if all required fields are provided
  if (!validateInsertData(req)) {
    res.status(400).send('Bad Request: All required fields are not provided.');
    return;
  }

  // Constructing the query dynamically based on the provided columns
  const columnsList = Object.keys(columns).join(', ');
  const placeholders = Object.keys(columns).fill('?').join(', ');

  const query = `
    INSERT INTO tabl1 (${columnsList})
    VALUES (${placeholders})
  `;

  // Binding values to placeholders dynamically
  const values = Object.values(columns);

  // Using parameterized query to prevent SQL injection
  db.query(query, values, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log("Data inserted successfully:", results);
    res.status(200).send('Data inserted successfully.');
  });
  
});




module.exports = router;
