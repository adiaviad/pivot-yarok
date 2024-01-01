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
    fetch('/api/getData')
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

function processData(csvData) {
    csvRow=csvData;
    console.log("csv first row", csvRow);
    let allCollumns={};
    fetch('api/getColumnNames').then(response => response.json()).then(data=>{
        const Keys=Object.keys(data[0]);
        for(let i=0;i<Keys.length;i++){
            const columnName = Keys[i];
            let value =csvRow[i];
            allCollumns[columnName]=value;
            console.log(columnName,value);
        }
        console.log("all columns",allCollumns);
        const d =JSON.stringify(allCollumns); 
        console.log("stringfy",d);
        
        fetch('api/insertData', {
            method: 'POST',
            body: d,
            headers: {
                'Content-Type': 'application/json',
            },
            
        })
        .then(response => {
            if (!response.ok) {
                console.log("repose",response);
            throw new Error('Network response was not ok');
            }
        })
        .then(data => {
            console.log('Success:', data);
            alert("נתונים הוזנו בהצלחה")
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error)
        });
    });




}
function readCSV(funcProcess) {
    const fileInput = document.getElementById('csvFileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const csvContent = e.target.result;

            // Parse the CSV content using Papa Parse
            Papa.parse(csvContent, {
                complete: function (result) {
                    // Result.data is an array of arrays containing the CSV values
                    console.log("reading csv",result.data);
                    if(!validateCSV(result.data)){
                        return;
                    }
                    // Process the CSV data as needed
                    funcProcess(calculateSuperMeasures(result.data));
                },
                header: false, // Set to true if the first row contains column headers
                dynamicTyping: true, // Automatically convert strings to numbers or booleans
            });
        };

        reader.readAsText(file);
    } else {
        alert('Please select a CSV file.');
    }
}

function calculateSuperMeasures(csvData){
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
    const all_measures=csvData[0];
    let newRow=[all_measures[0]];
    blueprints.forEach(bp=>{
        measures=all_measures.slice(bp.range.start,bp.range.end+1)
        newRow =newRow.concat(measures);
        newRow=newRow.concat(bp.calculation(measures));
    });
    return newRow;
}