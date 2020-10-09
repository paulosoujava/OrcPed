/**
 * Helper for various tasks
 */
// dependecies
var crypto = require('crypto')
var config = require('./config')
const handlers = require('./handlers')


 // container for all the helpers
 var helpers = {}


// create a SHA256
helpers.hash = (str) =>{
  if( !(typeof(str) == 'string' && str.length > 0 ) ) return false
  return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
 }

 // parse a json string to an object in al cases without thorwing
 helpers.parseJsonPayloadToObject = (str) =>{
   try {
     var obj = JSON.parse(str)
     return obj
   } catch(err) {
      return err
   }
 }

 // create the string of random to an object in all cases wothout throwing
 helpers.createRandomString = (number) => {
   number = typeof(number) == 'number' && number > 0 ? number : false
   if(number){
    // define all the possible characters that could go into s string
    var possibileCharacters = 'abcdefghijlmnopqrstuvxyz0123456789'
    var str = ''
    for( i = 1; i <= number; i++){
      // get a random character from the possibleCharacters string
      var randomCharacater = possibileCharacters.charAt(Math.floor(Math.random() * possibileCharacters.length))
      // append this character to the final string
      str += randomCharacater
    }

    return str

   }else{
     return false
   }
 }
 module.exports = helpers