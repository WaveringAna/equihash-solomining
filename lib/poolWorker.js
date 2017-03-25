var Stratum = require('./index.js');
var net = require('net');
var fs = require('fs');
var path = require('path');

module.exports = function() {
    var _this = this;

    var config = JSON.parse(process.env.config);
    var forkId = process.env.forkId;

    function authorizeFN(ip, port, workerName, password, callback) {
        console.log("Authorized " + workerName + ":" + password + "@" + ip);
        callback({
            error: null,
            authorized: true,
            disconnect: false
        });
    }

    var pool = Stratum.createPool(config, authorizeFN);
    pool.start();

    pool.on('share', function(isValidShare, isValidBlock, data) {
        if (isValidBlock) {
            console.log('***********'.cyan.underline.bold);
            console.log('Block ' + data.height + ' found: '.cyan.underline.italic + new Date().toString().cyan.underline.italic);
            console.log('***********'.cyan.underline.bold);
            console.log('Block: ' + data.height + ' Finder: ' + data.worker);
            api('block', {
                block: data.height,
                finder: data.worker,
                date: new Date().getTime()
            });
        } else if (isValidShare)
            console.log('Valid share submitted');
        else if (data.blockHash)
            console.log('We thought a block was found but it was rejected by the daemon');
        else
            console.log('Invalid share submitted')
    });

    pool.on('log', function(severity, logKey, logText) {
        console.log(severityToColor(severity, logKey));
    });

    function severityToColor(severity, text) {
        switch (severity) {
            case 'special':
                return text.cyan.underline;
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
    };

    function api(method, obj) {
        if (process.env.forkId && process.env.forkId !== '0') {
            return;
        }

        if (method === "block") {
            fs.readFile("./logs/blocks.json", 'utf8', function readFileCallback(err, data) {
                if (err) {
                    if (err.code === "ENOENT") {
                        var array = [];
                        array[0] = obj;
                        fs.writeFile("./logs/blocks.json", JSON.stringify(array), function(err) {
                            console.log("Error creating blocks.json: " + err);
                        })
                    } else {
                        console.log("Error reading blocks.json: " + err);
                    }
                } else {
                    var old = JSON.parse(data);
                    old.push(obj);

                    fs.writeFile("./logs/blocks.json", JSON.stringify(old), function writeFileCallback(err) {
                        if (err) console.log("Error updating blocks.json: " + err)
                    })
                }
            })
        }
    }
}
