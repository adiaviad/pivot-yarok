console.log("another file ")
function getResourceData(){
    return fetch('hon_planning_and_dev.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(data, { type: 'array' });
        //the third sheet is the one with "mash'ab hon"
        const sheetName = workbook.SheetNames[2];
        const sheet = workbook.Sheets[sheetName];
    
    
        const xslData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log("xsl begin",xslData);
        jsonData={
            "provinces_names":[],
            "resource_name":sheetName.slice(5),
            "x":[],
            "data_sets": []
        }
        jsonData.x=xslData[0].slice(1);

        //start with the second line bc the first line is the names of recources

        for(let i =1;i<xslData.length;i++){
            console.log("i len",i,xslData[i].length)
            if(xslData[i].length<1){
                break; //after the info about provinces there is a break and then other irrelevent data. we break to not add that data to the json
            }
            let province_name=xslData[i][0];
            jsonData.data_sets.push({
                "y":xslData[i].slice(1),
                "name":province_name
            });
            jsonData.provinces_names.push(province_name);
        }         
        return jsonData;
    })
    .catch(error => console.error('Error fetching the Excel file:', error));
}