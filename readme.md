חישב של מאשבי על ונתונים בסיסיים נמצא ב:  
top of codeDataInsert.js  
  
הדגרת התחום נתונים שמהם המשאבי הון לקחים נמצא ב  
top of codeDataLoad.js  
you can use python script in python_scripts/excelEquationsConversion.py to covert excel equations you paste in equations.txt to how they need to be in code. the converted equations are used in the json called "sm_blueprints" in the "calculation" key vlaue for each  
דוגמה למדד על 
```javascript
const sm_blueprints = [
    {
        name: "plan",
        range: {
            start: 1,
            end: 10
        },
        calculation: m => {
            const superm = []; 
            superm.push(/* the output of the python script*/);
            superm.push(m[0]); //example
            superm.push(10 * m[1]); //example
            return superm;
        }
    },
]
```

הגדרה של המשאבים, המדדים בהם והשמות שלהם ב
jsonNames.js  

הגדרה של השמות של עמודות עמודים במאגר נתונים צריכים להיות במאגר נתונים ובלמעלה
 api.js  
השמות של מדדי מוצגים אבל השמות של נתונים פשוטים לא מוצגים למשתמש. אם כתוב שנה כלשהו אז לכתוב "לפני שנה", "לפני שנתיים" וכן אלה   
השמות של העמודות excel יכולות להיות מומרות לשמות שצריכים להיות במאגר נתונים של ידי הכנסת השמות הרגילים לfixName.py ולהריץ אותו

קישור להורדה של התכונה של מאגר הנתונים   
https://dev.mysql.com/downloads/workbench/  

כדי להתחיל את את השרת/אתר:  
open cmd as admin any where to start the database server  
`sc start MySQL80`  


open cmd in this project folder to start the server
`node server/app.js`
