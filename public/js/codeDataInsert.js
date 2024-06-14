const sm_blueprints = [
    {
        name: "plan",
        range: {
            start: 1,
            end: 10
        },
        calculation: m => {
            const superm = [];
            superm.push(m[0]);
            superm.push(10 * m[1]);
            superm.push(m[3] * 10000 / m[6]);
            superm.push(1000 * (m[7] / m[4] + m[8] / m[5] + m[9] / m[6]) / 3);
            return superm;
        }
    },
    {
        name: "dev",
        range: {
            start: 11,
            end: 28
        },
        calculation: m => {
            const superm = [];
            superm.push((m[3] / m[0] + m[7] / m[1] + m[11] / m[2]) / 3 * 1000000);
            superm.push(((m[4] / m[0] + m[8] / m[1] + m[12] / m[2]) / 3) * 1000);
            superm.push(((m[5] / m[0] + m[9] / m[1] + m[13] / m[2]) / 3) * 1000000);
            superm.push(((m[6] / m[0] + m[10] / m[1] + m[14] / m[2]) / 3) * 1000);
            superm.push(((m[17] / m[2] + m[16] / m[1] + m[15] / m[0]) / 3) * 1000);
            return superm;
        }
    }
];
const measuresRangesInExcel = {
    "plan": {
        start: 0,
        end: 11
    },
    "dev": {
        start: 0,
        end: 19
    }
}
function validateInputData(measureNaming,xlsxArrayTable, number_of_rows, measure,projectname, year,filename,password) {
    if(measure==-1){
        alert("מדד על לא נבחר");
        return false;
    }
    const measureName=measureNaming[measure].name;
    if(!filename.includes(measureName)){
        alert(`הקובץ שנחבר לא תואם את המדד על שנבחר`+`\nהמדד שנבחר:${measureName}`+`\nהקובץ שחבר:${filename}`);
        return false;
    }
    if(projectname.split(" ").length>1 || projectname==""){
        alert("פרוייקט לא נבחר");
        return false;
    }
    if(year==""){
        alert("שנה לא נבחרה");
        return false;
    }
    if (number_of_rows < 1) {
        alert('מספר שורות לא נבחר');
        return false;
    }
    if (xlsxArrayTable.length != number_of_rows) {
        alert('מספר השורות במסכך לא תואם לצפוי');
        return false;
    }
    if (xlsxArrayTable[0].length != measuresRangesInExcel[measure].end) {
        alert('מספר העמודות במסמך לא תואם לצפוי');
        return false;
    }
    if (password == "") {
        alert('לא הוכנסה סיסמה');
        return false;
    }

    return true;
}


function inputSMdata(measureNaming,xlsxArrayTable, measure, number_of_rows, project, year,filename,password) {
    if (!validateInputData(measureNaming,xlsxArrayTable, number_of_rows, measure,project,year, filename,password)) {
        console.log("input not valid ,number_of_rows,measure,password,xlsxArrayTable", number_of_rows, measure, password, xlsxArrayTable);
        return;
    }
    console.log("xlsx Array table", xlsxArrayTable);
    let data=[];
    for (let i = 0; i < xlsxArrayTable.length; i++) {
        const row=xlsxArrayTable[i];
        const rowData=row.slice(1);
        console.log("row data, i",i,rowData);
        const superMeasureData=calculateSuperMeasure(rowData,measure);
        data.push(row.concat(superMeasureData));
        
    }
    console.log("inpustSMdata measure, data",measure,data);
    const b={"data":data,"pass":password};
    fetch(`/api/insertSuperMeasure/project/${project}/year/${year}/measure/${measure}`, { "method": 'POST', "body": JSON.stringify(b), "headers": { 'Content-Type': 'application/json', } })
        .then(response => {
            console.log(response);
            if (!response.ok) {
                console.log("repose", response);
                switch (response.status) {
                    case 401:
                        throw new Error("הסיסמא לא נכונה");
                    case 422:
                        throw new Error("נחבר מדד על שלא  מוגדר");
                    case 423:
                        throw new Error("לא נבחרה שנה");
                    case 406:
                        throw new Error("מספר העמודות במסמך לא תואם את הצפוי")
                    default:
                        throw new Error("בעית שרת לא ידועה");
                }
            } else {
                alert('נתונים עודכנו בהצלחה עבור\n' + `${project} ${year} ${measureNaming[measure].name}`);
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert("קרתה שגיאה\n",error);
        });

}




// function previewData(csvData) {
//     const csvRow = csvData;
//     const newTableRow = {};
//     const year = document.getElementById("yearInput").value;
//     if (year == "") {
//         alert("צריך לבחור שנה");
//         return;
//     }
//     fetch('/api/getData/' + year)
//         .then(response => response.json())
//         .then(data => {
//             const columnKeys = Object.keys(data[0]);
//             for (let i = 0; i < columnKeys.length; i++) {
//                 const columnName = columnKeys[i];
//                 if (i == 0) {
//                     newTableRow[columnName] = csvRow[i].toString();
//                 }
//                 else {
//                     newTableRow[columnName] = csvRow[i].toFixed(2).toString();
//                 }
//             }

//             data.push(newTableRow)
//             const selected_region = data.length - 1;
//             const previewContainer = document.getElementById("previewGraphicsContainer");

//             generateGraphicsFor(previewContainer, covertTableToJson(data), selected_region, () => 0);
//         })
//         .catch(error => console.error('Error fetching data:', error));
// }

// function processData(csvData, rowId, maxRowID) {
//     const year = document.getElementById("yearInput").value;
//     if (!isFinite(year)) {
//         alert("השנה שהוזנה לא תקינה");
//         console.log("invalid year", year);
//         return;
//     }
//     const userPassword = document.getElementById("passwordInput").value;
//     console.log("password", userPassword);
//     if (userPassword == null) {
//         alert("הכנס סיסמה");
//         return;
//     }
//     csvRow = calculateSuperMeasures(csvData[rowId]);
//     console.log("csv first row", csvRow);
//     let allCollumns = {};

//     fetch('api/getColumnNames/pre').then(response => response.json()).then(data => {
//         const Keys = Object.keys(data[0]);
//         if (csvRow.length != Keys.length) {
//             alert("מספר נתונים במסמך לא תואם את מספרים הנתונים הדרושים " + Keys.length);
//             return;
//         }
//         for (let i = 0; i < Keys.length; i++) {
//             const columnName = Keys[i];
//             let value = csvRow[i];
//             allCollumns[columnName] = value;
//             // console.log(columnName,value);
//         }

//         // console.log("all columns",allCollumns);

//         const dataAndUserinfo = { "data": allCollumns, "userInfo": { "pass": userPassword } };
//         const d = JSON.stringify(dataAndUserinfo);
//         console.log("stringfy", d);

//         fetch('api/insertData/' + year, {
//             method: 'POST',
//             body: d,
//             headers: {
//                 'Content-Type': 'application/json',
//             },

//         })
//             .then(response => {
//                 console.log(response);
//                 if (!response.ok) {
//                     console.log("repose", response);
//                     switch (response.status) {
//                         case 401:
//                             throw new Error("הסיסמא לא נכונה");
//                         case 422:
//                             throw new Error("הוכנס מספר לא צפוי של נתונים");
//                         case 423:
//                             throw new Error("לא נבחרה שנה");
//                         case 409:
//                             throw new Error(csvData[0] + "נתונים עבור הרשות כבר הוזנו השנה")
//                         default:
//                             throw new Error("בעית שרת לא ידועה");
//                     }
//                 }
//             })
//             .then(data => {
//                 console.log('Success:', data, rowId, maxRowID);
//                 if (rowId < maxRowID) {
//                     processData(csvData, rowId + 1, maxRowID);
//                 }
//                 else {
//                     alert("נתונים הוזנו בהצלחה");
//                 }
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 alert(error)
//                 if (rowId + 1 < maxRowID) {
//                     processData(csvData, rowId + 1, maxRowID);
//                 }
//                 else {
//                     alert("נתונים הוזנו בהצלחה");
//                 }
//             });
//     });




// }




function excelToArray(file, measure, rows_to_read, func) {
    const number_of_rows = rows_to_read;
    const xlsxArray = [];
    const end_of_data_col = measuresRangesInExcel[measure].end;
    const start_slice = measuresRangesInExcel[measure].start;

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Assume the first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert sheet to JSON
            const json = XLSX.utils.sheet_to_json(worksheet, { headers: 0 });
            console.log("xlsx json", json);
            let flag="ok";
            for (let i = 0; i < number_of_rows; i++) {
                console.log(json[i + 2]);
                if(json[i + 2]==null ||Object.values(json[i + 2])==null||Object.values(json[i + 2])[0]==null){
                    flag='no';
                    alert(`בעיה בקריאה הקובץ, בעיה אחרי קריאה של ${i} שורות`);
                    break;
                }
                xlsxArray.push(Object.values(json[i + 2]).slice(start_slice, end_of_data_col));
            }

            // Resolve the outer promise with the populated array
            console.log("func xlx array", xlsxArray);
            if(flag=="ok"){
                func(xlsxArray);
            }
        };



        reader.readAsArrayBuffer(file);
    } else {
        alert('Please select an Excel file.');
    }

}



function readInput(measureNaming) {
    const year = document.getElementById("yearSelector").value;
    const password = document.getElementById("passwordInput").value;
    const project = document.getElementById("projectnameSelector");
    const fileInput1 = document.getElementById('FileInput');
    const nor = document.getElementById("number_of_rowsInput").value;
    const measure = document.getElementById("supermeasureSelector").value;

    const projectname=project.options[project.value].text;
    console.log("year",year);
    console.log("measure",measure);
    console.log("project name",projectname);
    
  
    const file1 = fileInput1.files[0];
    if (nor < 1) {
        alert('צריך לבחור את כמות השורות שיוכנסו');
        return;
    }
    excelToArray(file1, measure, nor, xlsxArray1 => {
        console.log("xlsxArray1", xlsxArray1);
        inputSMdata(measureNaming,xlsxArray1,measure,nor,projectname,year,file1.name,password);
    });


}
//funcProcess(calculateSuperMeasures(result.data)); /// this is the important function

/**
 * modify this for calculations how super measures
 * the range is for when the whole data is concant into one row. ignore the range if you calculate one sm at a time
 */

function calculateSuperMeasures(Data) {

    const all_measures = Data;
    let newRow = [all_measures[0]];
    sm_blueprints.forEach(bp => {
        measures = all_measures.slice(bp.range.start, bp.range.end + 1)
        newRow = newRow.concat(measures);
        newRow = newRow.concat(bp.calculation(measures));

    });
    return newRow;
}
function calculateSuperMeasure(rowData,measure){
    let result=null;
    sm_blueprints.forEach(bp=>{
        if(bp.name==measure){
            result=bp.calculation(rowData);
        }
    });
    return result;
}

