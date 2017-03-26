var Stratum = require('../stratum/index.js');
var timestamp = require('../modules/timestamp.js');
var api = require('../modules/api.js');
var logging = require('../modules/logging.js');

var net = require('net');
var fs = require('fs');
var path = require('path');

module.exports = function() {
    var _this = this;

    var config = JSON.parse(process.env.config);
    var forkId = process.env.forkId;

    function authorizeFN(ip, port, workerName, password, callback) {
        logging("PoolWorker", "special" ,"Authorized " + workerName + ":" + password + "@" + ip, forkId);
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
            //console.log(('[ Thread ' + forkId + '][' + timestamp() + '] Block ' + data.height + ' found by ' + data.worker).cyan.underline.italic);
            logging('PoolWorker', 'special', 'Block ' + data.height + ' found by ' + data.worker)
            console.log('***********'.cyan.underline.bold);

            api('block', {
                block: data.height,
                finder: data.worker,
                date: new Date().getTime()
            });
        } else if (isValidShare)
            logging('PoolWorker', 'debug', 'Valid Share Found', forkId)
        else if (data.blockHash)
            logging('PoolWorker', 'error', 'We thought a block was found but it was rejected by the daemon', forkId)
    });

    pool.on('log', function(severity, logKey, logText) {
        //console.log(logging.severityToColor(severity, '[Thread ' + forkId + '][' + timestamp() + '] ' + logKey));
        logging('PoolWorker', 'debug', logKey, forkId);
    });
}
