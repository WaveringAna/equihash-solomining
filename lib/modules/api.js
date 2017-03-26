var logging = require('./logging.js')

var fs = require('fs');

module.exports = function(method, obj) {
    var forkId = process.env.forkId;

    if (method === "block") {
        fs.readFile('./logs/blocks.json', 'utf8', updateBlocksJSON);

        function updateBlocksJSON(err, data) {
            if (err) {
                if (err.code === "ENOENT") {
                    createBlocksJSON(obj)
                } else {
                    logging('Api', 'error', err, forkId)
                }
            }

            var object = JSON.parse(data)
            object.push(obj)

            fs.writeFile('./logs/blocks.json', JSON.stringify(object), done)
        }

        function createBlocksJSON(data) {
            fs.writeFile("./logs/blocks.json", JSON.stringify(array), done)
        }

        function done(err) {
            if (err) console.log(err)
            logging('Api', 'debug', 'Done updating logs/blocks.json', forkId);
        }
    }

    if (method === "stats") {

    }

    if (method === "live_stats") {

    }
}
