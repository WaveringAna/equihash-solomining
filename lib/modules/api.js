var timestamp = require('./timestamp.js')

var fs = require('fs');

module.exports = function(method, obj) {
    if (method === "block") {
        fs.readFile('./logs/blocks.json', 'utf8', updateBlocksJSON);

        function updateBlocksJSON(err, data) {
            if (err) {
                if (err.code === "ENOENT") {
                    createBlocksJSON(obj)
                } else {
                    console.log("[" + timestamp() + "]" + err)
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
            console.log("[" + timestamp() + "] Done updating logs/blocks.json")
        }
    }
}
