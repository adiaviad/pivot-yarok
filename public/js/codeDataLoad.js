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

    result.measurements_names=measureData[startOfProvinces-1].slice(rangeStart,rangeEnd);
    result.measurements_names.push("שם רשות");

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




function covertTableToJson(table){
    
    //the third sheet is the one with "משאב הון"
    const tableSlices={
        "planning_and_dev":{
            "hon":{
                name:"משאב פיתוח ותכנון",
                slice:{
                    end:
                }
            }
        }
    }
    const res = filterStringsStartingWith(workbook.SheetNames,"משאב")[0];
    const resSheet = workbook.Sheets[resName];
    
    const measurementsNames=filterStringsStartingWith(workbook.SheetNames,"מדד");

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
    const resData = XLSX.utils.sheet_to_json(resSheet, { header: 1 });

    const provinces_names=[];
    for(let i=1;i<resData.length;i++){
        if(resData[i].length<1){
            break;
        }
        provinces_names.push(resData[i][0]);
    }
    jsonData.res_profline=createResProfile(resData,resName,provinces_names);

    for(const mName of measurementsNames){
        const measureSheet=XLSX.utils.sheet_to_json(workbook.Sheets[mName], {header:1 });
        jsonData.super_measurements.push(createSuperMeasurement(measureSheet,mName,provinces_names));
    }


    console.log("json data before return",table);
    return json;

}