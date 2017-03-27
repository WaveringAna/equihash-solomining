var fs = require('fs');
var path = require('path');
var express = require('express');
var engine = require('express-dot-engine');
var async = require('async');

var logging = require('../modules/logging.js');
var Stratum = require('../stratum/index.js')
var daemon = require('../stratum/daemon.js')

module.exports = function() {
    var config = JSON.parse(process.env.config);
    var websiteConfig = config.website;


    var app = express();

    app.engine('dot', engine.__express);
    app.set('views', path.join(process.cwd() + '/website/public'));
    app.set('view engine', 'dot');

    app.use(express.static(process.cwd() + '/website/public'));

    app.get('/', function(req, res) {
        var blocks;
        var difficulty;
        var hashrate;

        daemon.interface(config.daemons, function(severity, message) {
            logging('Website', severity, message);
        });

        //var daemon = new Stratum.daemon.interface([config.daemons], function(severity, message) {

        async.series([
            function(callback) {
                daemon.cmd('getinfo', [], function(result) {
                    blocks = result[0].response.blocks;
                    difficulty = result[0].response.difficulty
                    callback(null)
                })
            },
            function(callback) {
                daemon.cmd('getnetworksolps', [], function(result) {
                    hashrate = result[0].response;
                    callback(null)
                })
            },
            function(callback) {
                res.render('index', {
                    blocks: blocks,
                    difficulty: difficulty,
                    hashrate: hashrate
                });
            }
        ])
    })

    app.get('/blocks.json', function(req, res) {
        res.sendFile(process.cwd() + '/logs/blocks.json');
    })

    var server = app.listen(websiteConfig.port, function() {
        var host = websiteConfig.host
        var port = server.address().port

        logging("Website", "debug", "Example app listening at http://" + host + ":" + port);
    })
}
