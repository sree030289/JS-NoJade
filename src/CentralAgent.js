class CentralAgent {
  constructor(load, solarGenerator, windGenerator, battery, grid) {
    this.load = load;
    this.solar = solarGenerator;
    this.wind = windGenerator;
    this.battery = battery;
    this.grid = grid;
  }

  manageEnergy(hour) {
    console.log(`\n--- Hour ${hour}: Starting energy management ---`);

    let load = this.load.getLoadAtHour(hour);
    let solarGeneration = this.solar.getGenerationAtHour(hour);
    let windGeneration = this.wind.getGenerationAtHour(hour);

    console.log(`Load: ${load} kW`);
    console.log(`Solar Generation: ${solarGeneration} kW`);
    console.log(`Wind Generation: ${windGeneration} kW`);

    // First, satisfy the load with solar and wind
    let solarContribution = Math.min(load, solarGeneration);
    load -= solarContribution;
    console.log(`Solar Contribution: ${solarContribution} kW, Remaining Load: ${load} kW`);

    let windContribution = Math.min(load, windGeneration);
    load -= windContribution;
    console.log(`Wind Contribution: ${windContribution} kW, Remaining Load: ${load} kW`);

    // Use battery if solar and wind are not enough
    let batteryContribution = 0;
    let batteryDelta = 0; // To track charging (+) or discharging (-)

    if (load > 0 && this.battery.getSOC() > 30) {
      batteryContribution = this.battery.discharge(load);
      load -= batteryContribution;
      batteryDelta = -batteryContribution; // Discharge
      console.log(`Battery Contribution: ${batteryContribution} kW, Remaining Load: ${load} kW`);
    } else {
      console.log(`Battery SOC is too low or not needed: ${this.battery.getSOC()}%`);
    }

    // Grid only provides the remaining load after all other sources
    let gridContribution = 0;
    if (load > 0) {
      gridContribution = this.grid.supply(load);
      console.log(`Grid Contribution: ${gridContribution} kW to cover remaining load`);
    } else {
      console.log(`Load fully met by solar, wind, and battery. No grid contribution needed.`);
    }

    // Handle surplus generation
    let surplusSolar = solarGeneration - solarContribution;
    let surplusWind = windGeneration - windContribution;
    let surplus = surplusSolar + surplusWind;

    console.log(`Surplus Solar: ${surplusSolar} kW`);
    console.log(`Surplus Wind: ${surplusWind} kW`);

    if (surplus > 0) {
      if (this.battery.getSOC() >= 95) {
        // If SOC is above 95%, send surplus to the grid
        this.grid.absorb(surplus);
        console.log(`Battery SOC is above 95%. Surplus Energy sent to Grid: ${surplus} kW`);
      } else {
        // Charge the battery first if SOC is below or equal to 95%
        batteryContribution = this.battery.charge(surplus);
        surplus -= batteryContribution;
        batteryDelta = batteryContribution; // Charge
        console.log(`Battery Charged: ${batteryContribution} kW, Remaining Surplus: ${surplus} kW`);

        if (surplus > 0) {
          this.grid.absorb(surplus);
          gridContribution = surplus;
          console.log(`Remaining Surplus Energy sent to Grid: ${surplus} kW`);
        }
      }
    } else {
      console.log(`No surplus energy.`);
    }

    // Handle SOC falling below 30% by charging from the grid
    if (this.battery.getSOC() < 30) {
      const requiredCharge = (30 - this.battery.getSOC()) * (this.battery.capacity / 100);
      const gridSupply = this.grid.supply(requiredCharge);
      const chargedAmount = this.battery.charge(gridSupply);
      batteryDelta = chargedAmount; // Charging from the grid
      console.log(`Battery SOC below 30%. Charged from Grid: ${chargedAmount} kW`);
    }

    console.log(`Battery SOC after hour ${hour}: ${this.battery.getSOC()}%`);

    return {
      solarContribution,
      windContribution,
      batteryContribution,
      batteryDelta, // Track battery delta for display
      gridContribution,
      batterySOC: this.battery.getSOC()
    };
  }
}

module.exports = CentralAgent;
