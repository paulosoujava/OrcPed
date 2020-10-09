 // Depedencies
 var http = require('http')
 var https = require('https')
 var url = require('url')
 const StringDecoder = require('string_decoder').StringDecoder
 const config = require('./config')
 const fs = require('fs')
 const handlers = require('./handlers')
 const helpers = require('./helpers')
 const path = require('path')

 var server = {}


  // instantiate the HTTP server
  server.httpServer = http.createServer(function(req, res){
    server.unifiedServer(req, res)
 })
 
  // instantiate the HTTPS server
  server.httpsServerOptions = {
      'key': fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
      'cert' :fs.readFileSync(path.join(__dirname,'/../https/cert.pe'))
  }
  server.httpsServer = https.createServer(server.httpsServerOptions, function(req, res){
    server.unifiedServer(req, res)
 })

 
  // all the server logic for both the htto and https server
  server.unifiedServer = function(req,res){
         //get the url and parse it
         var parsedUrl = url.parse(req.url, true)
     
         // get the path
         var path = parsedUrl.pathname
         var trimmedPath = path.replace(/^\/+|\/+$/g,'')
     
         //get the query string as an object
         var queryStringObject = parsedUrl.query
     
         // get the http method
         var method = req.method.toLocaleLowerCase()
     
         // get the headers as an object 
         var headers = req.headers
         
         // get the payload if any
         var decode = new StringDecoder('utf-8')
         var payload = ''
         req.on('data', function(data){
             payload += decode.write((data))
         })
         req.on('end', function(){
             payload += decode.end()
     
             // choose the handler this request should go to. If one is no found use the not found handler
             var chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ?  server.router[trimmedPath] : handlers.notFound
             
             //construct the data object to send to the handler
             var data = {
                 trimmedPath,
                 queryStringObject,
                 method,
                 headers,
                 payload : helpers.parseJsonPayloadToObject(payload)
             }
     
             // router the request to the handler specified in the router
             chosenHandler(data, function( statusCode, payload ){
                 // use the statusCode code back by handler, or default to 200
                 statusCode = typeof(statusCode) == 'number' ? statusCode : 500
                 //use the payload called back by the handler or default to an empty object
                 payload = typeof(payload) == 'object' ? payload : {}
     
                 // convert the payload to a string
                 var payloadString = JSON.stringify(payload)
     
                 // return the response
                // res.setHeader('Content-Type', 'application/json')
                 res.writeHead(statusCode)
                 res.end(payloadString)
                  // return
                  //  console.log(`Returning this response ${statusCode} and ${payloadString}`)
             })
     
             
              // log the request path
             // console.log(`Request received on 
             // path: ${trimmedPath}
             // with method ${method}
             // with query: ${JSON.stringify(queryStringObject)}
             // whit payload: ${payload} 
             // whit headers: ${JSON.stringify(headers)} ` )
         })
        
  }
 
  // define a request router
  server.router = {
      'users': handlers.users,
      'tokens': handlers.tokens,
       'checks': handlers.checks
  }
 
 
server.init = () => {
  // Start the  HTTP server 
    server.httpServer.listen(config.httpPort, function(){
        console.log(`The server HTTP is listenning on port ${config.httpPort}  ${config.envName} mode`);
    })
    // start the HTTPS server
    server.httpsServer.listen(config.httpsPort, function(){
        console.log(`The server HTTPS is listenning on port ${config.httpsPort}  ${config.envName} mode`);
    })
}

 module.exports = server
 