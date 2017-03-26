var chart = d3.select("#charts").append("svg");

window.onload = function () {
  blocks();
}

function createChart (chart, data, type, cback) {

}

function blocks() {
  httpRequest("blocks.json", function (err, json){
    var array = JSON.parse(json);  //Sample: [{"block":48759,"finder":"rx480","date":1490404074912},{"block":48760,"finder":"rx470","date":1490404148117}]
    var finder

    for (i in array) {

    }
  });
}

function httpRequest (req, cback) {
  var request.open('GET', req);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
        var data = JSON.parse(request.responseText);
        cback(null, data);
    } else {
        cback(request.status, null);
    }
  }

  request.onerror = function() {
      cback("Couldn't get the data :(", null);
  };

  request.send();
}
