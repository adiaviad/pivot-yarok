
function createColorArray(numbers) {
    // Sort the array to find percentiles
    let sortedNumbers = [...numbers].sort((a, b) => a - b);
    sortedNumbers=Array.from(new Set(sortedNumbers)); 
    const maxNumber=Math.max(...numbers);
    const minNumber=Math.min(...numbers);
    const diffMaxMin=maxNumber-minNumber;
    if(diffMaxMin<=0){
        diffMaxMin=1;
    }
    // Function to interpolate color based on percentile
    function interpolateColor(percentile) {
        const minColor = [247, 74, 77]; // Red
        const maxColor = [57, 191, 93]; // Green

        const r = Math.round(minColor[0] + (maxColor[0] - minColor[0]) * percentile);
        const g = Math.round(minColor[1] + (maxColor[1] - minColor[1]) * percentile);
        const b = Math.round(minColor[2] + (maxColor[2] - minColor[2]) * percentile);

        return `rgb(${r}, ${g}, ${b})`;
    }

    // Map each number to its corresponding color
    const colorArray = numbers.map((num) => {
        const percentile = (sortedNumbers.indexOf(num) + 1) / sortedNumbers.length;
        return interpolateColor(percentile);
    });

    return colorArray;
}

function calculateMedian(arr) {
    // Create a copy of the array to avoid modifying the original
    const sortedArray = [...arr].sort((a, b) => a - b);

    const length = sortedArray.length;

    if (length % 2 === 0) {
        // If the array has an even number of elements, return the average of the two middle values
        const middle1 = sortedArray[length / 2 - 1];
        const middle2 = sortedArray[length / 2];
        return (middle1 + middle2) / 2;
    } else {
        // If the array has an odd number of elements, return the middle value
        return sortedArray[Math.floor(length / 2)];
    }
    }
function calculateAverage(numbers) {
    if (numbers.length === 0) {
        return 0; // Avoid division by zero for an empty array
    }

    const sum = numbers.reduce((acc, value) => acc + value, 0);
    const average = sum / numbers.length;
    return average;
}
const calculateStandardDeviation = (array) => {
    const mean = array.reduce((acc, value) => acc + value, 0) / array.length;
    const squaredDifferences = array.map((value) => Math.pow(value - mean, 2));
    const variance = squaredDifferences.reduce((acc, value) => acc + value, 0) / array.length;
    const standardDeviation = Math.sqrt(variance);
    return standardDeviation;
};

function invertDatasets(jsonToInvert){
    const invertedData = {
        "x": jsonToInvert.x,
        "data_sets": []
    };

    for (let i = 0; i < jsonToInvert.x.length; i++) {
        const invertedSet = {
            "y": []
        };

        for (const dataSet of jsonToInvert.data_sets) {
            invertedSet.y.push(dataSet.y[i]);
        }

        invertedData.data_sets.push(invertedSet);
    }
    return invertedData;
}
function populateDropdownSelect(dropdown,stringArray){
    stringArray.forEach((string, index) => {
        const option = document.createElement("option");
        option.text = string;
        option.value = index;
        dropdown.add(option);
    });
}



function generatePlots(jsonData,containerGraph, containerBench,selected_region) {

    //invert axis
    
    const invertedData=invertDatasets(jsonData);

    //todo: add the mode and type of each graph to the json
    //store benchmark, avg and selected region values
    const statsData = {
        "x": invertedData.x,
        "data_sets": [
            {
                "y":[],
                "name":"benchmark",
                "mode":"lines+text",
                "type":"scatter",
                "orientation":"v",
                "fill":"tozeroy",
                "width":"",
                "legendgroup": "group1",
                "color":"rgba(250, 142, 248, 0.5)" //pink
            },
            {
                "y":[],
                "name":"selected region",
                "mode":"markers+text",
                "marker_size":12,
                "type":"bar",
                "orientation":"v",
                "fill":"tozerox",
                "width":"0.4",
                "legendgroup": "group2",
                "color":"rgba(14, 1, 102, 1)" //dark blue
            },
            {
                "y":[],
                "name":"חציון",
                "mode":"lines+text",
                "type":"",
                "orientation":"",
                "fill":"none",
                "width":"",
                "legendgroup": "group3",
                "color":"rgba(143, 4, 4, 1)" //dark red 

            }, 
            {
                "y":[],
                "name":"",
                "mode":"markers+text",
                "type":"bar",
                "orientation":"v",
                "fill":"tozerox",
                "width":"0.4",
                "legendgroup": "group2",
                "color":"rgba(14, 1, 102, 1)" //dark blue
            }          
        ]
    };

    for (const dataSet of invertedData.data_sets) {
        const max = Math.max(...dataSet.y);
        const standardDeviation = calculateStandardDeviation(dataSet.y);
        const median=calculateMedian(dataSet.y)
        const average=calculateAverage(dataSet.y);
        const benchmark=average+standardDeviation;
        
        statsData.data_sets[0].y.push(benchmark.toFixed(1));
        statsData.data_sets[2].y.push(median.toFixed(1));
        const selectedDiffFromBench=((1-(dataSet.y[selected_region]/benchmark))*100);
        statsData.data_sets[3].y.push(selectedDiffFromBench.toFixed(0));
    
    }
    //special code for selec
    statsData.data_sets[1].y=jsonData.data_sets[selected_region].y.map(num=>num.toFixed(1));
    statsData.data_sets[1].name=jsonData.data_sets[selected_region].name;
    // console.log("stats data", statsData);
    //display to graph
    const resData = [];
    const datasets=statsData.data_sets;
    const xValues = jsonData.x;
    for (let i = 0; i < datasets.length; i++) {
        const dataset = datasets[i];
        
        const trace = {
            x: xValues,
            y: dataset.y,
            mode: dataset.mode, // Display markers and 
            type: dataset.type,
            orientation: dataset.orientation,
            fill:dataset.fill,
            name: dataset.name, 
            width:dataset.width,
            fillcolor:dataset.color,
            marker: {
                color: dataset.color,
            },
            legendgroup: dataset.legendgroup,
            text:dataset.y,
            textposition: 'none',
            textfont: {
                size: 1,//not visible
            },
            insidetextanchor: 'start',
        };
        if(i==3){
            trace.text=dataset.y.map(n=>n+"%");
            // console.log("trace 3",trace);
        }

        resData.push(trace);
    }
    const resAnnotations=[];
    const benchDiffAnnotations=[]
    for (let i = 0; i < statsData.x.length; i++) {
        //benchmark annotaions
        resAnnotations.push({
            x: i+0.33, // X-coordinate of the bar
            y: resData[0].y[i], // Y-coordinate of the bar
            xref: 'x',
            yref: 'y',
            text: resData[0].text[i], // Text for the annotation
            showarrow: false,
            font: {
                size: 16,  // Set the font size
                color: 'black'  // Set the font color
            },
        });
        //bar annotations
        resAnnotations.push({
            x: i, // X-coordinate of the bar
            y: resData[1].y[i]*0.9, // Y-coordinate of the bar
            xref: 'x',
            yref: 'y',
            text: resData[1].text[i], // Text for the annotation
            showarrow: false,
            font: {
                size: 16,  // Set the font size
                color: 'white'  // Set the font color
            },
        });
        //
        benchDiffAnnotations.push({
            x: i, // X-coordinate of the bar
            y: resData[3].y[i]*0.9, // Y-coordinate of the bar
            xref: 'x',
            yref: 'y',
            text: resData[3].text[i], // Text for the annotation
            showarrow: false,
            font: {
                size: 16,  // Set the font size
                color: 'white'  // Set the font color
            },
        });
    }
    const resLayout = {
        title: jsonData.resource_name,
        annotations:resAnnotations
    };
    const diffLayout={
        title:"Benchmark פער באחוזים מה",
        annotations:benchDiffAnnotations

    }
    Plotly.newPlot(containerGraph, resData.slice(0,3), resLayout);
    Plotly.newPlot(containerBench, resData.slice(3,4), diffLayout);
    // console.log("resdata[3]",[resData[3]]);
}


function generateSuperMeasureSubTable(superMeasure,container,selected_region) {
    const superMeasureName=superMeasure.super_measure_name;
    const columnHeadersArray = superMeasure.measurements_names;
    const rowHeadersArray = superMeasure.provinces_names;
    const measureCollumns = superMeasure.measurements;
    const table = document.createElement("table");
    table.classList.add("madad");
    table.style.maxWidth=(columnHeadersArray.length*150)+"px";

    const collumnColorsArray=[];
    for(let i =0;i<measureCollumns.length;i++){
        collumnColorsArray.push(createColorArray(measureCollumns[i]));
    }
    // console.log("table",columnHeadersArray,rowHeadersArray,measureCollumns);
    // Create the header row with column headers
    const headerRow = table.insertRow();
    
    for (let colHeader of columnHeadersArray) {
        const th = document.createElement('th');
        th.appendChild(document.createTextNode(colHeader));
        headerRow.appendChild(th);
    }

    // Populate the table with data
    for (let rowIndex = 0; rowIndex < rowHeadersArray.length; rowIndex++) {
        const row = table.insertRow();
        
        
        // Add data cells
        for (let colIndex = 0; colIndex < measureCollumns.length; colIndex++) {
            const cell = row.insertCell();
            cell.appendChild(document.createTextNode(measureCollumns[colIndex][rowIndex]));
            cell.style.backgroundColor=collumnColorsArray[colIndex][rowIndex];
        }
        // Add row header cell
        const trh=document.createElement('trh');
        const rowheaderCell=row.insertCell();
        trh.appendChild(document.createTextNode(rowHeadersArray[rowIndex]));
        rowheaderCell.appendChild(trh);
        if(rowIndex==selected_region){
            rowheaderCell.style.backgroundColor="rgb(4, 113, 214)";
        }

    }
    
    const title=document.createElement("p");
    title.classList.add("super_measure_title");
    title.textContent=superMeasureName;

    container.appendChild(title);
    container.appendChild(table);
    container.appendChild(document.createElement("br"));
    // const new_row =document.getElementById(tableID).insertRow();
    // new_row.appendChild(table);
    // new_row.classList.add("mamad_tables_holder");
    
}

function generateSuperMeasureTables(superMeasureData,container,selected_region){
    container.innerHTML="";
    for(let i =0; i<superMeasureData.length;i++){
        generateSuperMeasureSubTable(superMeasureData[i],container,selected_region);
    }
}
//עבור משאב הון יחיד
function generateGraphicsForHon(honData,container,selected_region){
    container.innerHTML=""
    const honTable =document.createElement("table");
    const honRow=honTable.insertRow();
    const honResGraphContainer=honRow.insertCell();
    const honResBenchContainer=honRow.insertCell();
    honResBenchContainer.classList.add("hon_graphic");
    honResGraphContainer.classList.add("hon_graphic");
    honTable.classList.add("hon_table");
    container.appendChild(honTable);

    const containerMadad= document.createElement("div");
    containerMadad.classList.add("centered")

    container.appendChild(containerMadad);
    const resJson=honData.res_profline;
    const superMeasureData=honData.super_measurements;

    generatePlots(resJson,honResGraphContainer,honResBenchContainer,selected_region);
    generateSuperMeasureTables(superMeasureData,containerMadad,selected_region);
}

function generateGraphicsFor(container,jd,firstSelection){
    let selected_region=firstSelection;
    let resJson=jd.res_profline;
    let superMeasureData=jd.super_measurements;

    const dropdown=document.createElement("select");
    dropdown.classList.add("selector");
    
    const graphicContainer=document.createElement("div");
    graphicContainer.classList.add("centered");
    graphicContainer.classList.add("graphicContainer");

    container.appendChild(dropdown);
    container.appendChild(graphicContainer);




    console.log("promise from code.js",jd);
    
    populateDropdownSelect(dropdown,resJson.provinces_names);
    generateGraphicsForHon(jd,graphicContainer,selected_region);
    dropdown.selectedIndex=selected_region;
    
    dropdown.addEventListener("change", function() {
        const selectedIndex = this.value;
        selected_region=selectedIndex;
        generateGraphicsForHon(jd,graphicContainer,selected_region);
    });


}