const express = require('express');
const router = express.Router();
const db = require('../db/db');
const tableName='table';
db.clo
router.get('/getData/:year', (req, res) => {
  db.query('SELECT * FROM '+tableName+req.params.year, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
    
  });
});

router.get('/getColumnNames/:year', (req, res) => {

  // Query to get column names for the specified table
  const query = `SELECT * FROM ` +tableName+req.params.year+ ` LIMIT 1;`;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

function validateInsertData(year,columns,pass,errFunc,successFunc){
  if (pass !=="iamapassword"){
    console.log("recieved password",pass);
    errFunc({ok:false,error:"password doesn't match",code:401});
    return false;
  }
  else {
    //2021 is the first table in the db is i know it has data. the rest might not have
    const query = `SELECT * FROM ` +tableName+2021+ ` LIMIT 1;`;
    console.log("quary", query);
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        errFunc({ok:false,error:"internal error",code:500})
        return false;
      }
      console.log(results);
      console.log("validate insert data",Object.keys(results[0]));
      DBcolumnNumber=Object.keys(results[0]).length;
      inputColumnsNumber=Object.keys(columns).length;
      console.log("DB columns",DBcolumnNumber);
      console.log("user columns",inputColumnsNumber);
      if ( inputColumnsNumber==DBcolumnNumber){
        console.log("was successful ")
        successFunc();
      }
      else{
        console.log("there was an error")
        errFunc({ok:false,error:"number of parameters doesn't match with database",code:422})
      }
      
    });
  }

  
}

router.post('/insertData/:year', (req, res) => {
  const { ...columns } = req.body.data;
  const password=req.body.userInfo.pass;
  const year=req.params.year;

  // Check if all required fields are provided
 validateInsertData(year,columns,password,
    err=>{
      res.status(err.code).send();
    },
    ()=>{
      // Constructing the query dynamically based on the provided columns
      const columnsList = Object.keys(columns).join(', ');
      const placeholders = Object.keys(columns).fill('?').join(', ');

      const query = `
        INSERT INTO ${tableName+year} (${columnsList})
        VALUES (${placeholders})
      `;

      // Binding values to placeholders dynamically
      const values = Object.values(columns);
      db.query(query, values, (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          if (error.code=="ER_DUP_ENTRY"){
            res.status(409).send("duplicate record");
          }
          else{
            res.status(500).send('Internal Server Error');
          }
          return;
        }
        console.log("Data inserted successfully:", results);
        res.status(200).send('Data inserted successfully.');
      });
    }
  )
   
});
function createNewTable(year){
const originalTableName = 'table2021';
// New table name
const newTableName = 'table'+year;//todo: validate year is a nunmber

// Retrieve column names and types from the original table
db.query(`SHOW COLUMNS FROM ${originalTableName}`,(error,rows) => {
    // Extract column names and types
    const columns = rows.map(row => `${row.Field} ${row.Type}`).join(', ');

    // Create a new table with the same structure
    return db.execute(`CREATE TABLE ${newTableName} (${columns})`,(error)=>
    {
      if (error){
        console.log(error);
      }
    }
    );
  });
}



module.exports = router;
