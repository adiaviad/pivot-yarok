function getDefinedIndexes(arr) {
    const definedIndexes = [];

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== undefined) {
        definedIndexes.push(i);
        }
    }

    return definedIndexes;
}

function filterStringsStartingWith(arr, word) {
    const result = arr.filter((str) => {
        // Split the string into words
        const words = str.split(' ');

        // Check if the first word is equal to the given word
        return  words[0] === word;
    });

    return result;
}

function createResProfile(resData, name,provinces_names){
    const result={
        "provinces_names": provinces_names,
        "resource_name": name,
        "x": [],
        "data_sets": []
    }
    result.x = resData[0].slice(1);
    //start with the second line bc the first line is the names of recources

    for(let i =1;i<resData.length;i++){
        if(resData[i].length<1){
            break; //after the info about provinces there is a break and then other irrelevent data. we break to not add that data to the json
        }
        
        result.data_sets.push({
            "y":resData[i].slice(1),
            "name":resData[i][0]
        });
    }    
    return result;     

}
function createSuperMeasurement(measureData,name,provinces_names){
    console.log("measurement data",measureData);
    result={
        "super_measure_name":name,
        "provinces_names":provinces_names,   
        "measurements_names":[],
        "measurements":[]//array of collumns
    };
    //first range is start of regualr measurements, second is start of super, third is normalized super 
    const startOfProvinces=getDefinedIndexes(measureData.map(row=>row[0]))[1];

    const measurementsRanges=getDefinedIndexes(measureData[0]);
    const rangeStart=measurementsRanges[1];
    const rangeEnd=measurementsRanges[2];
    console.log("measurement ranges",measurementsRanges);

    result.measurements_names=measureData[startOfProvinces-1].slice(rangeStart,rangeEnd);
    result.measurements_names.push("שם רשות");
    console.log("mesurement names",result.measurements_names,measureData[startOfProvinces-1]);

    console.log("startOfProvinces",startOfProvinces);
    //start at the fourth line bc the first three have attributes names
    for(let j=rangeStart;j<rangeEnd;j++){
        const collumn=[];
        for(let i=startOfProvinces;i<measureData.length;i++){
            if(measureData[i].length<1){
                break;
            }
            collumn.push(measureData[i][j].toFixed(1));
        }
        result.measurements.push(collumn); 
    }

    return result;
}




function getResourceData(){
    return fetch('hon_planning_and_dev.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(data, { type: 'array' });
        //the third sheet is the one with "משאב הון"
        const resName = workbook.SheetNames[2];
        const resSheet = workbook.Sheets[resName];
        const measurementName=workbook.SheetNames[1];
        const measurementsSheet=workbook.Sheets[measurementName];
        
        const resData = XLSX.utils.sheet_to_json(resSheet, { header: 1 });
        const measureData = XLSX.utils.sheet_to_json(measurementsSheet, { header: 1 });

        let jsonData = {
            "res_profline": {},
            "super_measurements":[
                // example:
                // {
                //     "super_measure_name":"",
                //     "provinces_names":[],   
                //     "measurements_names":[],
                //     "measurements":[[]]// array of collumns (collumn is an array)
                // }
            ]
        };
        const provinces_names=[];
        for(let i=1;i<resData.length;i++){
            if(resData[i].length<1){
                break;
            }
            provinces_names.push(resData[i][0]);
        }
        console.log("json data begin",jsonData);
        jsonData.res_profline=createResProfile(resData,resName,provinces_names);
        jsonData.super_measurements.push(createSuperMeasurement(measureData,measurementName,provinces_names));
        return jsonData;
    })
    .catch(error => console.error('Error fetching the Excel file:', error));
}