console.log("another file ")
function getResourceData(){
    return fetch('hon_planning_and_dev.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(data, { type: 'array' });
        //the third sheet is the one with "mash'ab hon"
        const sheetName = workbook.SheetNames[2];
        const sheet = workbook.Sheets[sheetName];
    
    
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 0 });
        console.log(jsonData);
        return jsonData;
    })
    .catch(error => console.error('Error fetching the Excel file:', error));
}