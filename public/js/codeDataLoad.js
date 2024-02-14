function averageOf(numbers) {
    if (numbers.length === 0) {
        return 0; // Avoid division by zero for an empty array
    }

    const sum = numbers.reduce((acc, value) => acc + value, 0);
    const average = sum / numbers.length;
    return average;
}
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
        "measurements":[],//array of collumns
        "normalized_measurements":[]
    };



    //start at the fourth line bc the first three have attributes names
    for(let i=0;i<measurements_names.length;i++){
        const collumn=measureDataRowsValues.map(row=> parseFloat(row[i]));
        result.measurements.push(collumn); 
        result.normalized_measurements.push(normalizeNumbers(collumn,10));
    }
    result.measurements_names.push("שם רשות");

    return result;
}
function fixName(name){
    return name.replace("b", ' (').replace("b", ') ').replace("d","-").replace(/_/g, ' ');
}

function getResourceLabels(superMeasures){
    let labels=superMeasures.map(measure=>measure.name);
    labels.push("ממוצע");
    return labels;
}
function normalizeNumbers(numbers,mul){
    const maxValue = Math.max(...numbers);
    const normalizedNumbers= numbers.map(num=>(mul*num)/maxValue);
    return normalizedNumbers;
}
function createHonProfile(resSlice,table,provinces_names){
    const resKeys=getResourceLabels(resSlice.super_measures);
    let resRows =[];

    let honProfile = {
        "res_profline": {},
        "super_measurements":[
            // example:
            // {
            //     "super_measure_name":"",
            //     "provinces_names":[],   
            //     "measurements_names":[],
            //     "measurements":[[]],// array of collumns (collumn is an array)
            //     "normalized_measurements": [[]]     
            // }
        ]
    };
    for  (let i =0; i<resSlice.super_measures.length;i++){
        const rows=sliceTableToValues(table,resSlice.super_measures[i].slice);
        const keys=sliceTableToKeys(table,resSlice.super_measures[i].slice);
        honProfile.super_measurements.push(createSuperMeasurement(rows,resSlice.super_measures[i].name,provinces_names,keys));
    }
    for (let i =0; i<provinces_names.length;i++ ){
        resRows.push(honProfile.super_measurements.
            map(sm=>averageOf(sm.normalized_measurements.
                map(coll=>coll[i]))))
    }

    resRows.forEach(row=>row.push(averageOf(row)))
    
    honProfile.res_profline=createResProfile(resRows,resSlice.name,provinces_names,resKeys);


    return honProfile;

}

function covertTableToJson(table){
    console.log("table to json",table);
    const firstKey=Object.keys(table[0])[0];

    const provinces_names=table.map(row=>row[firstKey]);
    const honProfiles=[]
    /**
     * modify this to create more hon resources
     */

    const resourceSlices=
    [ 
        {
            name:"משאב פיתוח ותכנון",
            
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
                        start:33,
                        end:37
                    }
                },
            
            ]
        },
    ];
    resourceSlices.forEach(slice=>{
        honProfiles.push(createHonProfile(slice,table,provinces_names));
    });
    console.log("first prof", honProfiles[0]);
    console.log("profiles", honProfiles);

    return honProfiles;
    
}