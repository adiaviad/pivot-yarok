const express = require('express');
const router = express.Router();
const db = require('../db/db');
const superSecretGoodPassword = "pass";
const dataPrimaryKey='שם_רשות';
const smColumnNames = [
  {
    name: "plan",
    columnNames: [
      'קיום_תכנית_מתאר_כוללת_לרשות_המקומית_מדד',
      'יחידה_לתכנון_אסטרטגי_מדד',
      'מספר_העובדים_בתכנון_ובנייה_תקן',
      'מספר_העובדים_בתכנון_ובנייה_ביצוע',
      'סהכ_אוכלוסייה_בסוף_השנה_2018_מדד_תכנון',
      'סהכ_אוכלוסייה_בסוף_השנה_2019_מדד_תכנון',
      'סהכ_אוכלוסייה_בסוף_השנה_2020_מדד_תכנון',
      'תקציב_רגילb_תשלומים_תכנון_ובניין_עירbבאלפי_שקליםb2018',
      'תקציב_רגילb_תשלומים_תכנון_ובניין_עירbבאלפי_שקליםb2019',
      'תקציב_רגילb_תשלומים_תכנון_ובניין_עירbבאלפי_שקליםb2020',
      'קיום_תכנית_מתאר_כוללת_לרשות_המקומית',
      'יחידה_לתכנון_אסטרטגי',
      'מספר_העובדים_בתכנון_ובנייה_לd10000_נפש',
      'ההוצאה_בפועל_על_תכנון_ובניין_עיר_לתושב'
    ]
  },
  {
    name: "dev",
    columnNames: [
      'סהכ_אוכלוסייה_בסוף_השנה_2018_מדד_פיתוח',
      'סהכ_אוכלוסייה_בסוף_השנה_2019_מדד',
      'סהכ_אוכלוסייה_בסוף_השנה_2020_מדד',
      'שטח_לכלל_השימושיםbאלפי_מטר_רבועbהתחילת_בניה_2018',
      'דירות_בתחלת_בנייה_2018',
      'שטח_לכלל_השימושיםbאלפי_מטר_רבועbגמר_בניה_2018',
      'דירות_גמר_בניה_2018',
      'שטח_לכלל_השימושיםbאלפי_מטר_רבועbהתחילת_בניה_2019',
      'דירות_בתחלת_בנייה_2019',
      'שטח_לכלל_השימושיםbאלפי_מטר_רבועbגמר_בניה_2019',
      'דירות_גמר_בניה_2019',
      'שטח_לכלל_השימושיםbאלפי_מטר_רבועbהתחילת_בניה_2020',
      'דירות_בתחלת_בנייה_2020',
      'שטח_לכלל_השימושיםbאלפי_מטר_רבועbגמר_בניה_2020',
      'דירות_גמר_בניה_2020',
      'הוצאות_בתקציב_הבלתי_רגילbבאלפי_שקליםb2018',
      'הוצאות_בתקציב_הבלתי_רגילbבאלפי_שקליםb2019',
      'הוצאות_בתקציב_הבלתי_רגילbבאלפי_שקליםb2020',
      'שטח_לכלל_השימושיםbמטר_רבוע_לd1000_תושביםbתחילת_בניה',
      'מגוריםbדירות_לd1000_תושביםbתחילת_בניה',
      'שטח_לכלל_השימושיםbמטר_רבוע_לd1000_תושביםbגמר_בניה',
      'מגוריםbדירות_לd1000_תושביםbגמר_בניה',
      'תקציב_בלתי_רגיל_לנפש'
    ]
  }
]


router.get("/getProjectsMetaData",(req,res)=>{
  console.log("getProjectsMeta", req.body);

  db.query('SELECT * FROM allprojects', (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);

  });
});

router.get('/getData/project/:projectname/:year', (req, res) => {
  console.log("getData", req.params);

  db.query('SELECT * FROM ' + req.params.projectname + "_table" + req.params.year, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);

  });
});


router.get('/getColumnNames/:project', (req, res) => {
  console.log("get columns", req.body);

  // Query to get column names for the specified table
  const query = `SELECT * FROM sampletable LIMIT 1;`;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(results);
  });
});

function tableName(projectName,year){
  return  projectName + '_table' + year;
}

function createNewTable(projectname, year, onFinish) {
  const originalTableName = 'sampletable';
  // New table name
  const newTableName =tableName(projectname,year);//todo: validate year is a nunmber

  // Retrieve column names and types from the original table
  db.query(`SHOW COLUMNS FROM ${originalTableName}`, (error, rows) => {
    // Extract column names and types
    const columns = rows.map(row => `${row.Field} ${row.Type}`).join(', ');
    const firstColumnName = rows[0].Field;
    // console.log(columns);
    // Create a new table with the same structure
    return db.execute(`CREATE TABLE ${newTableName} (${columns},  PRIMARY KEY (${firstColumnName}))`, (error) => {
      if (error) {
        console.log(error);
      }
      onFinish(error);
    }
    );
  });
}


function validateInsertData(year, columns, pass, errFunc, successFunc) {
  if (!isFinite(year)) {
    console.log("invalid year", year);
    errFunc({ ok: false, error: "year is invalid", code: 423 });
    return false;
  }
  if (pass !== superSecretGoodPassword) {
    console.log("recieved password", pass);
    errFunc({ ok: false, error: "password doesn't match", code: 401 });
    return false;
  }
  else {
    const query = `SELECT * FROM sampletable LIMIT 1;`;
    console.log("quary", query);
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error executing query:', error);
        errFunc({ ok: false, error: "internal error", code: 500 })
        return false;
      }
      console.log(results);
      console.log("validate insert data", Object.keys(results[0]));
      DBcolumnNumber = Object.keys(results[0]).length;
      inputColumnsNumber = Object.keys(columns).length;
      console.log("DB columns", DBcolumnNumber);
      console.log("user columns", inputColumnsNumber);
      if (inputColumnsNumber == DBcolumnNumber) {
        console.log("was successful ")
        createNewTable(year, () => successFunc());

      }
      else {
        console.log("there was an error")
        errFunc({ ok: false, error: "number of parameters doesn't match with database", code: 422 })
      }

    });
  }

}
function insertProjectYears(name, start, end, callback,errFunc) {
  const query = `INSERT INTO allprojects (projectName, startYear, endYear) VALUES (?, ?, ?);`
  db.query(query, [name, start, end], (err) => {
    if (err) {
      console.log("insert project year error:", err)
      errFunc(err);
    } else {
      callback();
    }
  });

}
//maybe later i want to do more so i'm making this a function
function isPassCorrect(pass){
  return pass==superSecretGoodPassword; 
}



router.post('/createProject/project/:projectname/startyear/:syear/endyear/:eyear', (req, res) => {
  console.log("create project", req.params);
  const startyear = req.params.syear;
  const endyear = req.params.eyear;
  const projectname = req.params.projectname;
  const pass = req.body.pass;

  if (!isPassCorrect(pass)) {
    res.status(401).send("password does not match");
    return;
  }

  insertProjectYears(projectname, startyear, endyear, () => {
    for (let year = startyear; year <= endyear; year++) {
      createNewTable(projectname, year, (err) => {
        console.log("create new table err, year, project", err, year, projectname);
        if (year == endyear) {
          res.status(200).send("project created successfully");
        }
      });
    }
  },(err)=>{
    if(err.code =="ER_DUP_ENTRY"){
      res.status(409).send("project name already exist");
    }else{
      res.status(500).send("server error");
    }
  });

});

router.post('/insertSuperMeasure/project/:projectname/year/:year/measure/:measure', (req, res) => {
  console.log("insertSuperMeasure/project",req.params)
  if(req.body.data==null){
    res.status(400).send("no data provided, invalid request");
    return;
  }

  const rows  = req.body.data;
  const password = req.body.pass;
  const year = req.params.year;
  const measure = req.params.measure;
  const projectname = req.params.projectname;
  console.log("insertSuperMeasure rows",rows);
  console.log("params",req.params);
  if(!isPassCorrect(password)){
    res.status(401).send("password does not match");
    return;
  }
  let sm=null;
  smColumnNames.forEach(element => {
    if(element.name==measure){
      sm=element;
    }
  });
  
  if(sm==null){
    res.status(422).send("measure name don't not exist");
    return;
  }
  const column_names= [dataPrimaryKey].concat(sm.columnNames);
  console.log("column_names",column_names);
  console.log("DB data len, new data len",column_names.length,rows[0].length);

  if(column_names.length!=rows[0].length){
    res.status(406).send("data length does not match DB ");
    console.log("err data length does not match DB",column_names.length,rows[0].length);
    return;
  }

  const column_names_string = column_names.join(', ');
  const placeholders= rows.map(row=>`(${column_names.map(n=>"?").join(", ")})`).join(",");
  const updateStatement=column_names.map(n=>`${n} = values(${n})`).join(", "); 
  let values=[];
  for (let i = 0; i < rows.length; i++) {
    values.push(...rows[i]);
  }
  values=values.map((val,index)=>{
    if((typeof val )==='number'){

      return val.toFixed(2)
    }else{
      return val;
    }
  });
  console.log(values);
  
  const quary=`INSERT INTO ${tableName(projectname,year)} (${column_names}) VALUES ${placeholders} on duplicate key update ${updateStatement};`;
  console.log("insertSuperMeasure query",quary);
  db.query(quary,values,(error,results)=>{
    console.log("error",error);
    if(error==null){
      res.status(200).send("data inserted");
    }
    else{
      res.status(400).send(error.message);
    }
  });
});


router.post('/insertData/project/:projectname/year/:year', (req, res) => {
  console.log("insertData/project/:projectname/year/:year",req.params);
  const { ...columns } = req.body.data;
  const password = req.body.userInfo.pass;

  const year = req.params.year;
  const projectname = req.params.projectname;


  // Check if all required fields are provided
  validateInsertData(year, columns, password,
    err => {
      res.status(err.code).send();
    },
    () => {
      // Constructing the query dynamically based on the provided columns
      const columnsList = Object.keys(columns).join(', ');
      const placeholders = Object.keys(columns).fill('?').join(', ');

      const query = `
        INSERT INTO ${tableName(projectname,year)} (${columnsList})
        VALUES (${placeholders})
      `;

      // Binding values to placeholders dynamically
      const values = Object.values(columns);
      db.query(query, values, (error, results) => {
        if (error) {
          console.error('Error executing query:', error);
          if (error.code == "ER_DUP_ENTRY") {
            res.status(409).send("duplicate record");
          }
          else {
            res.status(500).send('Internal Server Error');
          }
          return;
        }
        console.log("Data inserted successfully:", results);
        db.query(`INSERT INTO years (year) VALUES (${year});`, (error, results) => {
          if (error) {
            console.log("error years", error);
          }
          else {
            console.log("results years", year);
          }
        });
        res.status(200).send('Data inserted successfully.');
      });
    }
  );

});


// insertProjectYears("t",0,4,(err)=>{
//   const projectname="t"
//   if(err){
//     console.log("test insert years:",err);
//   }else{
//   for (let year = 0; year <4; year++) 
//     createNewTable(projectname,year,(err)=>{console.log("create new table err, year, project",err,year,projectname);});
//   }

// });
// insertProjectYears("asds",0,3);
// db.query(`SELECT * FROM sampletable LIMIT 1;`, (error, results) => {
//   if (error) {
//     console.error('Error executing query:', error);
//     return;
//   }
//   console.log(Object.keys(results[0]));
// });

module.exports = router;
