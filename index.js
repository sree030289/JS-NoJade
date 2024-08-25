const path = require('path');
const ExcelUtils = require('./src/utils');
const Load = require('./src/Load');
const SolarGenerator = require('./src/SolarGenerator');
const WindGenerator = require('./src/WindGenerator');
const Battery = require('./src/Battery');
const Grid = require('./src/Grid');
const CentralAgent = require('./src/CentralAgent');

const excelUtils = new ExcelUtils(path.join(__dirname, 'src', 'data.xlsx'));
const { load, solar, wind } = excelUtils.readHourlyData();

const loadInstance = new Load(load);
const solarInstance = new SolarGenerator(solar);
const windInstance = new WindGenerator(wind);
const batteryInstance = new Battery(1000, 0.5); // Example values for capacity and initial SOC
const gridInstance = new Grid();
const agent = new CentralAgent(loadInstance, solarInstance, windInstance, batteryInstance, gridInstance);

// Helper function to add delay
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  for (let hour = 0; hour < 24; hour++) {
    const results = agent.manageEnergy(hour);
    excelUtils.writeResults(hour, results);

    // Wait for 3 seconds before processing the next hour
    await wait(3000);
  }

  console.log(`Energy management completed. Results saved to: ${excelUtils.getOutputFilePath()}`);
})();
