class SolarGenerator {
    constructor(hourlyGeneration) {
      this.hourlyGeneration = hourlyGeneration; // an array of solar generation values per hour
    }
  
    getGenerationAtHour(hour) {
      return this.hourlyGeneration[hour];
    }
  }

  module.exports = SolarGenerator;
