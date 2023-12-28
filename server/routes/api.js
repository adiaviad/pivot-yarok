const express = require('express');
const router = express.Router();
const db = require('../db/db');

router.get('/getData', (req, res) => {
  db.query('SELECT * FROM tabl1', (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

module.exports = router;
