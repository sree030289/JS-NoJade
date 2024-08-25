class Grid {
    supply(amount) {
      return amount; // The grid can always supply the requested amount
    }
  
    absorb(amount) {
      return amount; // The grid can always absorb the excess energy
    }
  }
  module.exports = Grid;
