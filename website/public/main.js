var groupedByFinder;

window.onload = function() {
    blocks(done);
}

function createChart(chart, data, title) {
    var array = [];
    var svgwidth = 1000;
    var width = 360;
    var height = 360;
    var radius = Math.min(width, height) / 2;
    var color = d3.scaleOrdinal(d3.schemeCategory20c);

    Object.keys(data).forEach(function(i) {
        var obj = {};
        obj.label = i
        obj.value = data[i].length
        array.push(obj)
    });

    console.log(JSON.stringify(array))

    var legendRectSize = 18;
    var legendSpacing = 5;

    var svg = d3.select('#charts')
        .append('svg')
        .attr('width', svgwidth)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    var pie = d3.pie()
        .value(function(d) {
            return d.value;
        })
        .sort(null);

    var path = svg.selectAll('path')
        .data(pie(array))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d, i) {
            return color(d.data.label);
        });

    var legend = svg.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            var height = legendRectSize + legendSpacing;
            var offset = height * color.domain().length / 2;
            var horz = 12 * legendRectSize;
            var vert = i * height;
            return 'translate(' + horz + ',' + vert + ')';
        });

    legend.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color);

    legend.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .text(function(d,i) {
            return array[i].label;
        });

    done("charts");
}

function blocks(cback) {
    httpRequest("/blocks.json", function(err, json) {
        array = JSON.parse(json); //Sample: [{"block":48759,"finder":"rx480","date":1490404074912},{"block":48760,"finder":"rx470","date":1490404148117}]
        groupedByFinder = groupBy(array, 'finder');

        var tablediv = document.getElementById('info'),
            table = document.createElement('table'),
            thead = document.createElement('thead'),
            tbody = document.createElement('tbody');
        table.className = 'table table-hover table-striped';

        var theadTR = document.createElement('tr');
        var theadTH1 = document.createElement('th');
        var theadTH2 = document.createElement('th');
        theadTH1.appendChild(document.createTextNode('Finder'));
        theadTH2.appendChild(document.createTextNode('Blocks'));
        theadTR.appendChild(theadTH1);
        theadTR.appendChild(theadTH2);
        thead.appendChild(theadTR);
        table.appendChild(thead);

        Object.keys(groupedByFinder).forEach(function(i) {
            var row = document.createElement("tr");
            var cell1 = document.createElement("td");
            var cell2 = document.createElement("td");
            cell1.appendChild(document.createTextNode(i))
            cell2.appendChild(document.createTextNode(groupedByFinder[i].length))
            row.appendChild(cell1);
            row.appendChild(cell2);
            tbody.appendChild(row)
            table.appendChild(tbody)
            tablediv.appendChild(table)
        });
        cback("blocks")
        createChart('pie', groupedByFinder, blocks);
    });
}

function httpRequest(req, cback) {
    var request = new XMLHttpRequest()

    request.open('GET', req);

    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            var data = request.responseText;
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

function groupBy(xs, key) {
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {})
}

function done(func) {
    console.log("Done: " + func)
}
