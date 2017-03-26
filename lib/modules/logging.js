var colors = require('colors')

function severityToColor(severity, text) {
    switch (severity) {
        case 'special':
            return text.cyan;
        case 'debug':
            return text.green;
        case 'warning':
            return text.yellow;
        case 'error':
            return text.red;
        default:
            console.log("Unknown severity " + severity);
            return text.italic;
    }
}

function timestamp() {
    var date = new Date;
    var timestamp = date.getFullYear() + "/" +
        ("0" + (date.getMonth() + 1)).slice(-2) + "/" +
        ("0" + date.getDate()).slice(-2) + " " +
        ("0" + date.getHours()).slice(-2) + ":" +
        ("0" + date.getMinutes()).slice(-2) + ":" +
        ("0" + date.getSeconds()).slice(-2);
    return timestamp;
}

module.exports = function(worker,severity, text, forkId) {
  if (forkId == null) {
      console.log(severityToColor(severity, '[' + worker + '][Thread 0][' + timestamp() + '] '+ text))
  } else {
      console.log(severityToColor(severity, '[' + worker + '][Thread ' + forkId + '][' + timestamp() + '] ' + text))
  }
}
