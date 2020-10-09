var server = require('./lib/server')
var workers = require('./lib/workers')

var app = {}

app.init = () =>{
  server.init()
  workers.init()
}

app.init()

module.exports = app