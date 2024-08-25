const xlsx = require('xlsx');
const path = require('path');

class ExcelUtils {
  constructor(templateFilePath) {
    this.templateFilePath = templateFilePath;
    this.workbook = xlsx.readFile(templateFilePath);
    this.sheet = this.workbook.Sheets[this.workbook.SheetNames[0]];
    
    // Create a new file name with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.outputFilePath = path.join(path.dirname(templateFilePath), `output_${timestamp}.xlsx`);
    
    // Copy the entire sheet data to the new output file
    this.outputWorkbook = xlsx.utils.book_new();
    const outputSheet = xlsx.utils.aoa_to_sheet(xlsx.utils.sheet_to_json(this.sheet, { header: 1, raw: true }));
    xlsx.utils.book_append_sheet(this.outputWorkbook, outputSheet, 'Sheet1');
    this.outputSheet = this.outputWorkbook.Sheets['Sheet1'];
    
    // Read headers to find column indices
    this.headers = xlsx.utils.sheet_to_json(this.sheet, { header: 1 })[0];
    this.columnIndices = {};
    this.headers.forEach((header, index) => {
      this.columnIndices[header] = index + 1; // +1 because column indices in Excel are 1-based
    });
  }

  readHourlyData() {
    const data = xlsx.utils.sheet_to_json(this.sheet, { header: 1 });
    
    let load = [];
    let solar = [];
    let wind = [];
    
    data.slice(1).forEach((row) => {
      load.push(row[this.columnIndices['Load'] - 1]);
      solar.push(row[this.columnIndices['Solar'] - 1]);
      wind.push(row[this.columnIndices['Wind'] - 1]);
    });
    
    return { load, solar, wind };
  }

  writeResults(hour, results) {
    const rowIndex = hour + 2; // Offset for 0-based index and header row
  
    // Update Solar and Wind contributions
    this.outputSheet[xlsx.utils.encode_cell({ r: rowIndex - 1, c: this.columnIndices['Solar'] - 1 })] = { t: 'n', v: results.solarContribution };
    this.outputSheet[xlsx.utils.encode_cell({ r: rowIndex - 1, c: this.columnIndices['Wind'] - 1 })] = { t: 'n', v: results.windContribution };
  
    // Battery Charge/Discharge as + or - value
    const batteryDelta = results.batteryDelta;
    const batteryDisplay = batteryDelta >= 0 ? `+${batteryDelta}` : `${batteryDelta}`; // + for charge, - for discharge
    this.outputSheet[xlsx.utils.encode_cell({ r: rowIndex - 1, c: this.columnIndices['Battery Charge/ Discharge'] - 1 })] = { t: 's', v: batteryDisplay };
  
    // Battery SOC as a percentage
    this.outputSheet[xlsx.utils.encode_cell({ r: rowIndex - 1, c: this.columnIndices['Battery SOC'] - 1 })] = { t: 'n', v: results.batterySOC  };
  
    // Grid Charge/Discharge as + or - value
    const gridDelta = results.gridContribution;
    const gridDisplay = gridDelta >= 0 ? `+${gridDelta}` : `${gridDelta}`; // + for charge, - for discharge
    this.outputSheet[xlsx.utils.encode_cell({ r: rowIndex - 1, c: this.columnIndices['Grid Charge /Discharge'] - 1 })] = { t: 's', v: gridDisplay };
  
    // Write to the new Excel file with the timestamped name
    xlsx.writeFile(this.outputWorkbook, this.outputFilePath);
  }
  

  getOutputFilePath() {
    return this.outputFilePath;
  }
}

module.exports = ExcelUtils;
