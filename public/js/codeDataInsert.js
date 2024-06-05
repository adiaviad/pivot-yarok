//<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.8.0/xlsx.js"></script>
function validateCSV(csvData){
    if (csvData.length>1){
        alert('the file cannot have more than 1 line');
        return false;
    }
    // if(Object.keys(csvData[0]).length!=38){
    //     alert('wrong number of measures');
    //     return false;
    // }

    return true;
}


function previewData(csvData){
    const csvRow=csvData;
    const newTableRow={};
    const year=document.getElementById("yearInput").value;
    if(year==""){
        alert("צריך לבחור שנה");
        return;
    }
    fetch('/api/getData/'+year)
    .then(response => response.json())
    .then(data => {
        const columnKeys=Object.keys(data[0]);
        for(let i=0;i<columnKeys.length;i++){
            const columnName = columnKeys[i];
            if(i==0){
                newTableRow[columnName]=csvRow[i].toString();
            }
            else {
                newTableRow[columnName]=csvRow[i].toFixed(2).toString();
            }
        }

        data.push(newTableRow)
        const selected_region=data.length-1;
        const previewContainer=document.getElementById("previewGraphicsContainer");

        generateGraphicsFor(previewContainer,covertTableToJson(data),selected_region,()=>0);
    })
    .catch(error => console.error('Error fetching data:', error));
}

function processData(csvData,rowId,maxRowID) {
    const year=document.getElementById("yearInput").value;
    if( !isFinite(year)){
        alert("השנה שהוזנה לא תקינה");
        console.log("invalid year",year);
        return;
    }
    const userPassword=document.getElementById("passwordInput").value;
    console.log("password",userPassword);
    if(userPassword==null){
        alert("הכנס סיסמה");
        return;
    }
    csvRow=calculateSuperMeasures(csvData[rowId]);
    console.log("csv first row", csvRow);
    let allCollumns={};
    
    fetch('api/getColumnNames/2021').then(response => response.json()).then(data=>{
        const Keys=Object.keys(data[0]);
        if(csvRow.length!=Keys.length){
            alert("מספר נתונים במסמך לא תואם את מספרים הנתונים הדרושים "+ Keys.length);
            return;
        }
        for(let i=0;i<Keys.length;i++){
            const columnName = Keys[i];
            let value =csvRow[i];
            allCollumns[columnName]=value;
            // console.log(columnName,value);
        }

        // console.log("all columns",allCollumns);
       
        const dataAndUserinfo={"data":allCollumns,"userInfo":{"pass":userPassword}};
        const d =JSON.stringify(dataAndUserinfo); 
        console.log("stringfy",d);
        
        fetch('api/insertData/'+year, {
            method: 'POST',
            body: d,
            headers: {
                'Content-Type': 'application/json',
            },
            
        })
        .then(response => {
            console.log(response);
            if (!response.ok) {
                console.log("repose",response);
                switch( response.status){
                    case 401:
                        throw new Error("הסיסמא לא נכונה");
                    case 422:
                        throw new Error("הוכנס מספר לא צפוי של נתונים");
                    case 423:
                        throw new Error("לא נבחרה שנה");
                    case 409:
                        throw new Error(csvData[0]+"נתונים עבור הרשות כבר הוזנו השנה")
                    default:
                        throw new Error("בעית שרת לא ידועה");
                }
            }
        })
        .then(data => {
            console.log('Success:', data,rowId,maxRowID);
            if(rowId<maxRowID){
                processData(csvData,rowId+1,maxRowID);
            }
            else{
                alert("נתונים הוזנו בהצלחה");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error)
            if(rowId+1<maxRowID){
                processData(csvData,rowId+1,maxRowID);
            }
            else{
                alert("נתונים הוזנו בהצלחה");
            }
        });
    });




}
function excelToArray(file,id,func) {
        const number_of_rows = document.getElementById("number_of_rows").value;
        const xlsxArray = [];
        let end_of_data_col,start_slice;
        if(id==0){
            end_of_data_col=11;//K
            start_slice=0;
        }else if(id==1){
            end_of_data_col=19;//S
            start_slice=1;
        }
        if (file) {
            const reader = new FileReader();

            reader.onload = function(e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Assume the first sheet
                const firstSheetName = workbook.SheetNames[id];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert sheet to JSON
                const json = XLSX.utils.sheet_to_json(worksheet, { headers: 0 });
                console.log("xlsx json",json);

                for (let i = 0; i < number_of_rows; i++) {
                    xlsxArray.push(Object.values(json[i + 2]).slice(start_slice, end_of_data_col));
                }

                // Resolve the outer promise with the populated array
                console.log("func xlx array", xlsxArray);
                func(xlsxArray);
            };

          

            reader.readAsArrayBuffer(file);
        } else {
            alert('Please select an Excel file.');
        }
    
}


function concatArrays(ar1,ar2){
    console.log("array 1 func",ar1);
    console.log("array 2 func",ar2);
    let array3=[];
    for (let index = 0; index < ar1.length; index++) {
        array3.push(ar1[index])
    }
    for (let index = 0; index < ar2.length; index++) {
        array3.push(ar2[index])
    }
    console.log("array3",array3);
    return array3;

}

function readCSV(funcProcess) {
    const fileInput1 = document.getElementById('csvFileInput_develop_2020');
    const fileInput2 = document.getElementById('csvFileInput_planning_2020');
    const nor = document.getElementById("number_of_rows").value;
    const file1 = fileInput1.files[0];
    const file2 = fileInput1.files[0];

    excelToArray(file1,0, xlsxArray1 => {
        console.log("sdsa");
        excelToArray(file2,1,xlsxArray2 => {
            console.log("affdsfd");
            // You can use the xlsxArray here
            let array3=[];
            for (let index = 0; index < xlsxArray1.length; index++) {
                array3.push(concatArrays(xlsxArray1[index],xlsxArray2[index]));
            }
            console.log("concanted xlsxs",array3);
            funcProcess(array3,0,nor);
            
            
        });
    });

}
//funcProcess(calculateSuperMeasures(result.data)); /// this is the important function

/**
 * modify this for calculations how super measures
 */
function calculateSuperMeasures(Data){
    const blueprints=[
        {
            name:"planning",
            range:{
                start:1,
                end:10
            },
            calculation:m=>{
                const superm=[];
                superm.push(m[0]);
                superm.push(10*m[1]);
                superm.push(m[3]*10000/m[6]);
                superm.push(1000*(m[7]/m[4]+m[8]/m[5]+m[9]/m[6])/3);
                return superm;
            }
        },
        {
            name:"planning",
            range:{
                start:11,
                end:28
            },
            calculation:m=>{
                const superm=[];
                superm.push((m[3]/m[0]+m[7]/m[1]+m[11]/m[2])/3*1000000);
                superm.push(((m[4]/m[0]+m[8]/m[1]+m[12]/m[2])/3)*1000);
                superm.push(((m[5]/m[0]+m[9]/m[1]+m[13]/m[2])/3)*1000000);
                superm.push(((m[6]/m[0]+m[10]/m[1]+m[14]/m[2])/3)*1000);
                superm.push(((m[17]/m[2]+m[16]/m[1]+m[15]/m[0])/3)*1000);
                return superm;
            }
        }
    ];
    const all_measures=Data;
    let newRow=[all_measures[0]];
    blueprints.forEach(bp=>{
        measures=all_measures.slice(bp.range.start,bp.range.end+1)
        newRow =newRow.concat(measures);
        newRow=newRow.concat(bp.calculation(measures));

    });
    return newRow;
}
