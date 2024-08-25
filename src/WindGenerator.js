class WindGenerator {
    constructor(hourlyGeneration) {
      this.hourlyGeneration = hourlyGeneration; // an array of wind generation values per hour
    }
  
    getGenerationAtHour(hour) {
      return this.hourlyGeneration[hour];
    }
  }

  module.exports = WindGenerator;
