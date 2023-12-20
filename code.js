console.log("another file ")
fetch('hon_planning_and_dev.xlsx')
  .then(response => response.arrayBuffer())
  .then(data => {
    var workbook = XLSX.read(data, { type: 'array' });

    // Assuming the first sheet is of interest
    var sheetName = workbook.SheetNames[0];
    var sheet = workbook.Sheets[sheetName];

    // Access sheet data as JSON
   
    var jsonData = XLSX.utils.sheet_to_json(sheet, { header: 0 });
    console.log(jsonData);
  })
  .catch(error => console.error('Error fetching the Excel file:', error));
