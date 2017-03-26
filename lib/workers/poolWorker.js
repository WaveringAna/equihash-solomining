var Stratum = require('../stratum/index.js');
var timestamp = require('../modules/timestamp.js');
var api = require('../modules/api.js');

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
            console.log(('[' + timestamp() + '] Block ' + data.height + ' found by ' + data.worker).cyan.underline.italic);
            console.log('***********'.cyan.underline.bold);
            api('block',{
                [data.height]: {
                    finder: data.worker,
                    date: new Date().getTime()
                }
            });
        } else if (isValidShare)
            console.log('Valid share submitted');
        else if (data.blockHash)
            console.log('We thought a block was found but it was rejected by the daemon');
        else
            console.log('Invalid share submitted')
    });

    pool.on('log', function(severity, logKey, logText) {
        console.log(severityToColor(severity, '[' + timestamp() +'] ' + logKey));
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
}
