// serverSpecificFunctions.js
// ========
module.exports = {
  /**
    This function takes a number input and
    returns the english word for the numbered day.
  **/
  numberToName: function numberToName(dayNumber) {
    switch (dayNumber) {
        case "0":
            return "Sunday";
        case "1":
            return "Monday";
        case "2":
            return "Tuesday";
        case "3":
            return "Wednesday";
        case "4":
            return "Thursday";
        case "5":
            return "Friday";
        case "6":
            return "Saturday";
    }
  }

};
