class Load {
    constructor(hourlyLoads) {
      this.hourlyLoads = hourlyLoads; // an array of load values per hour
    }
  
    getLoadAtHour(hour) {
      return this.hourlyLoads[hour];
    }
  }
module.exports = Load;
