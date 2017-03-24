var config = require('./config.json');

var colors = require('colors');
var fs = require('fs');
var cluster = require('cluster');
var os = require('os');

var Stratum = require('./lib/index.js')
var CliListener = require('./lib/cliListener.js');
var PoolWorker = require('./lib/poolWorker.js');

var coinFilePath = 'coins/' + config.coin;
if (!fs.existsSync(coinFilePath)) {
    console.log('Master', config.coin, 'could not find file: ' + coinFilePath);
    return;
}

var coinProfile = JSON.parse(fs.readFileSync(coinFilePath, {
    encoding: 'utf8'
}));

config.coin = coinProfile;

try {
    var posix = require('posix');
    try {
        posix.setrlimit('nofile', { soft: 100000, hard: 100000 });
    }
    catch(e){
        if (cluster.isMaster)
            logger.warning('POSIX', 'Connection Limit', '(Safe to ignore) Must be ran as root to increase resource limits');
    }
    finally {
        // Find out which user used sudo through the environment variable
        var uid = parseInt(process.env.SUDO_UID);
        // Set our server's uid to that user
        if (uid) {
            process.setuid(uid);
            logger.debug('POSIX', 'Connection Limit', 'Raised to 100K concurrent connections, now running as non-root user: ' + process.getuid());
        }
    }
}
catch(e){
    if (cluster.isMaster)
        console.log('POSIX Connection Limit (Safe to ignore) POSIX module not installed and resource (connection) limit was not raised');
}


if (cluster.isWorker){
    switch(process.env.workerType){
        case 'pool':
            new PoolWorker();
            break;
        case 'website':
            break;
    }

    return;
}


function spawnPoolWorkers() {
    var numForks = (function() {
        if (!config.clustering || !config.clustering.enabled)
            return 1;
        if (config.clustering.forks === 'auto')
            return os.cpus().length;
        if (!config.clustering.forks || isNaN(config.clustering.forks))
            return 1;
        return config.clustering.forks;
    })();

    var poolWorkers = {};

    function createPoolWorker(forkId) {
        var worker = cluster.fork({
            workerType: 'pool',
            forkId: forkId,
            config: JSON.stringify(config)
        });
        worker.forkId = forkId;
        worker.type = 'pool';
        poolWorkers[forkId] = worker;
        worker.on('exit', function(code, signal) {
            console.log('Fork ' + forkId + ' died, spawning replacement worker...'.red.underline.bold);
            setTimeout(function() {
                createPoolWorker(forkId);
            }, 2000);
        }).on('message', function(msg) {
            switch (msg.type) {
                case 'banIP':
                    Object.keys(cluster.workers).forEach(function(id) {
                        if (cluster.workers[id].type === 'pool') {
                            cluster.workers[id].send({
                                type: 'banIP',
                                ip: msg.ip
                            });
                        }
                    });
                    break;
            }
        });
    }

    var i = 0;
    var spawnInterval = setInterval(function() {
        createPoolWorker(i);
        i++;
        if (i === numForks) {
            clearInterval(spawnInterval);
            console.log('Spawned proxy on ' + numForks + ' thread(s)');
        }
    }, 250);
}

function startCliListener () {
  var cliPort = config.cliPort;

      var listener = new CliListener(cliPort);
      listener.on('log', function(text){
          console.log('CLI: '+ text);
      }).on('command', function(command, params, options, reply){

          switch(command){
              case 'blocknotify':
                  Object.keys(cluster.workers).forEach(function(id) {
                      cluster.workers[id].send({type: 'blocknotify', coin: params[0], hash: params[1]});
                  });
                  reply('Workers notified');
                  break;
              default:
                  reply('unrecognized command "' + command + '"');
                  break;
          }
  }).start();
}

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

(function init() {
  spawnPoolWorkers();
  startCliListener();
})()
