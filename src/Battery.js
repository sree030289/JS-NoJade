class Battery {
  constructor(capacity, initialSOC) {
    this.capacity = capacity;
    this.currentSOC = initialSOC; // SOC as a fraction (0 to 1)
  }

  discharge(amount) {
    // Check if SOC is already at or above 95%
    if (this.currentSOC <= 0.30) {
      console.log(`Battery SOC is at or above 95%. Charging not allowed.`);
      return 0.30;
    }
    const availableEnergy = this.currentSOC * this.capacity;
    const energyToDischarge = Math.min(availableEnergy, amount);
    this.currentSOC -= energyToDischarge / this.capacity;
    
    return energyToDischarge;
  }

  charge(amount) {
    // Check if SOC is already at or above 95%
    if (this.currentSOC >= 0.95) {
      console.log(`Battery SOC is at or above 95%. Charging not allowed.`);
      return 0.95;
    }

    const availableCapacity = this.capacity * (1 - this.currentSOC);
    const energyToCharge = Math.min(availableCapacity, amount);
    this.currentSOC += energyToCharge / this.capacity;

    return energyToCharge;
  }

  getSOC() {
    if (this.currentSOC >= 1) {
      this.currentSOC = 0.95;
    }
    if (this.currentSOC <= 0.3) {
      this.currentSOC = 0.3;
    }
    return this.currentSOC * 100; // Convert to percentage
  }
}

module.exports = Battery;
