function sliceTableToValues(table,s){
    return table.map(row=>Object.values(row).slice(s.start,s.end+1));
}
function sliceTableToKeys(table,s){
    return Object.keys(table[0]).slice(s.start,s.end+1);
}

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

function createResProfile(resDataRowsValues, name,provinces_names,XLabels){
    const result={
        "provinces_names": provinces_names,
        "resource_name": name,
        "x": XLabels.map(name =>fixName(name)),
        "data_sets": []
    }
    //start with the second line bc the first line is the names of recources

    for(let i =0;i<resDataRowsValues.length;i++){
        result.data_sets.push({
            "y":resDataRowsValues[i].map(value=>parseFloat(value)),
            "name":provinces_names[i]
        });
    }    
    return result;     

}
function createSuperMeasurement(measureDataRowsValues,name,provinces_names,measurements_names){
    result={
        "super_measure_name":name,
        "provinces_names":provinces_names,   
        "measurements_names":measurements_names.map(name=>fixName(name)),
        "measurements":[]//array of collumns
    };



    //start at the fourth line bc the first three have attributes names
    for(let i=0;i<measurements_names.length;i++){
        const collumn=measureDataRowsValues.map(row=> parseFloat(row[i]));
        result.measurements.push(collumn); 
    }
    result.measurements_names.push("שם רשות");

    return result;
}
function fixName(name){
    return name.replace("b", ' (').replace("b", ') ').replace("d","-").replace(/_/g, ' ');
}



function covertTableToJson(table){
    console.log(table);
    console.log(table[0]);
    console.log("keys",Object.keys( table[0]));
    console.log("values",Object.values( table[0]));
    // console.log(Object.keys(table[0]).map(key=>table[0][key]));
    const firstKey=Object.keys(table[0])[0];

    console.log("first key",firstKey);
    const provinces_names=table.map(row=>row[firstKey]);
    console.log("provinces names",provinces_names);

    //the third sheet is the one with "משאב הון"
    const resourceSlices=
    [ 
        {
            name:"משאב פיתוח ותכנון",
            slice:{
                start:15,
                end:17
            },
            super_measures:[
                {
                    name:"מדד על תכנון",
                    slice:{
                        start:11,
                        end:14
                    }
                },
                {
                    name:"מדד על פיתוח",
                    slice:{
                        start:36,
                        end:40
                    }
                },
            
            ]
        },
    ];

    // console.log("resourceSlices[0].supermeasure[0] ",resourceSlices[0].super_measures[0]);
    const resRows=sliceTableToValues(table,resourceSlices[0].slice);
    const resKeys=sliceTableToKeys(table,resourceSlices[0].slice);
    // console.log("res rows ",resRows);
    console.log("res keys ",resKeys);
    const planningRows=sliceTableToValues(table,resourceSlices[0].super_measures[0].slice);
    const planningKeys=sliceTableToKeys(table,resourceSlices[0].super_measures[0].slice);
    // console.log("planning rows: ", planningRows);
    const devRows=sliceTableToValues(table,resourceSlices[0].super_measures[1].slice);
    const devKeys=sliceTableToKeys(table,resourceSlices[0].super_measures[1].slice);

    // console.log("dev rows: ", devRows);
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
    jsonData.res_profline=createResProfile(resRows,resourceSlices[0].name,provinces_names,resKeys);
    for  (let i =0; i<resourceSlices[0].super_measures.length;i++){
        const rows=sliceTableToValues(table,resourceSlices[0].super_measures[i].slice);
        const keys=sliceTableToKeys(table,resourceSlices[0].super_measures[i].slice);
        jsonData.super_measurements.push(createSuperMeasurement(rows,resourceSlices[0].super_measures[i].name,provinces_names,keys));
    }
  

    console.log("json data before return",jsonData);
    return jsonData;

}