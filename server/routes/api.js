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
    console.log("query json", results);
    res.json(results);
    
  });
});

router.get('/getColumnNames', (req, res) => {
  // const tableName = 'table1'; // Replace with your actual table name

  // Query to get column names for the specified table
  const query = `SELECT COLUMN_NAME
                 FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_NAME = '${tableName}'`;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    console.log("Column names:", results);
    res.json(results);
  });
});
module.exports = router;
