
const { env } = require('process')
const { create } = require('./data')
 //Dependencies
 const _data = require('./data')
 const helpers = require('./helpers')

 var handlers = {}
 const acceptableMethods = ['post', 'get', 'put', 'delete']

 handlers.users = function(data, callback){
  if(acceptableMethods.indexOf(data.method) > -1 ){
    console.log(data.method);
    handlers._users[data.method](data, callback)
  }else{
    callback(405, 'Method not allowed')
  }
 
 } 

handlers._users = {}

/**
 * User - POST
 * Required data: firstName lastName phone password tosAgreement
 */
handlers._users.post = (data, callback) =>{
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length >= 2 ? data.payload.firstName : false
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length >= 2 ? data.payload.lastName : false
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length >= 2 ? data.payload.phone.replace(/ /g,'') : false
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length >= 2 ? data.payload.password : false
  var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean'  && data.payload.tosAgreement ? data.payload.tosAgreement : false
  
  if( firstName && lastName && phone && password && tosAgreement ){
    _data.read('users', phone, (err, data) =>{
          if( err ){
            // hash the password
            var hashedPassword = helpers.hash(password)

              if(!hashedPassword )  return callback(400, {'error' : true, message: 'Could not create a hash password'})

            // create the user object
            var userObject = {
              firstName,
              lastName,
              phone,
              password:hashedPassword,
              tosAgreement: true
            }
            // Store the user
            _data.create( 'users', phone, userObject , (err, data) =>{
              if( err ) return callback(400, {'error' : true, message: 'Could not create a new user'})

              return callback(200, {error: false, message: 'success', data: userObject})
            })
          }else{
            callback( 400, {'error' : true, message: 'A user with phone number already exists'})
          }
    })
  }else{
    callback( 400, {'error' : true, message: 'Missing required fields'})
  }
}

/**
 * User - GET
 * Required data: phone
 * Otional data: none
 */
handlers._users.get = (data, callback) => {
  // check that the phone number is valid
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length >= 2 ? data.queryStringObject.phone.replace(/ /g,'') : false
  if(!phone) return callback( 400, {'error' : true, message: 'Missing querie fields'})

  //get the token from the headers
  var token = typeof(data.headers.token) == 'string' ? data.headers.token : false
  handlers.verifyToken(token, phone, (isValid) =>{
     if(isValid){
      _data.read('users', phone, (err, data) => {
        if(!err && data ){
          //removed the hash password from the user object before returning it to the request
          delete data.hashedPassword
          return callback(200, data)
        }
        callback(404, {'error' : true, message: 'Not found'})
      })
     }else{
      callback(404, {'error' : true, message: 'Token Not found'})
     }
  })
}

/**
 * User - PUT
 * Required data: phone
 * Optional data: firstName ,lastName, password (at least one must bi specified)
 */
handlers._users.put = (data, callback) => {
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length >= 2 ? data.queryStringObject.phone.replace(/ /g,'') : false
  if(!phone) return callback( 400, {'error' : true, message: 'Missing querie fields'})

  // check otional fields
  var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length >= 2 ? data.payload.firstName : false
  var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length >= 2 ? data.payload.lastName : false
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length >= 2 ? data.payload.password : false
  
   // error if the phone is invalid
   if(phone){
     // error if nothing is sent to update
      if( firstName || lastName || password){
        handlers.verifyToken(token, phone, (isValid) =>{
          if(isValid){
                // lookup the user
              _data.read('users', phone, (err, userData) => {
                if(!err && userData ){
                  // update the fields necessary
                  if( firstName ) userData.firstName = firstName
                  if( lastName ) userData.lastName = lastName
                  if( password ) userData.password = helpers.hash(password)

                  // store the new updates
                  _data.update('users', phone, userData, (err) => {
                    if(err){
                      callback(500, {'error' : true, message: 'Ops, could not update user an error '+ err})
                    }else{
                      callback(200, {'error' : false, message: 'success in updated'})
                    }
                  })
                }else{
                  callback(400, {'error' : true, message: 'The especified user does not exist'})
                }
              })
           }else{
             callback(404, {'error' : true, message: 'Token Not found'})
            }
        })
      }else{
        callback(400, {'error' : true, message: 'Missing fields to update'})
      }
   }else{
    callback(400, {'error' : true, message: 'Missing required field'})
   }
  
}


/**
 * User - DELETE
 * Required field: phone
 */
handlers._users.delete = (data, callback) => {
  var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length >= 2 ? data.queryStringObject.phone.replace(/ /g,'') : false

  if(phone){
    handlers.verifyToken(token, phone, (isValid) =>{
      if(isValid){ 
        _data.read('users', phone, (err, data) => {
          if(!err && data){
               _data.delete('users', phone, (err) =>{
                 if(err){
                   callback(500, {'error' : true, message: 'Could not delete the specified user'})
                 }else{
     
                   callback(200, {'error' : false, message: 'success deleted'})
                 }
               })
             }else{
               callback(404, {'error' : true, message: 'The especified user does not exist'})
             }
         })
     }else{
      callback(404, {'error' : true, message: 'Token Not found'})
      }
    })
  }else{
    callback( 400, {'error' : true, message: 'Missing querie field'})
  }
}



const acceptableTokensMethods = ['post', 'get', 'put', 'delete']
handlers._tokens = {}
 handlers.tokens = function(data, callback){
  if(acceptableTokensMethods.indexOf(data.method) > -1 ){
    console.log(data.method);
    handlers._tokens[data.method](data, callback)
  }else{
    callback(405, 'Method not allowed')
  }
 } 

 // container for all the tokens methods
 /**
  * TOKENS - POST
  * Requerid data: phone, password
  * Optional data: none
  */
 handlers._tokens.post = (data, callback) => {
  var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length >= 2 ? data.payload.phone.replace(/ /g,'') : false
  var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length >= 2 ? data.payload.password : false
   if(phone && password ){
      _data.read('users', phone, (err, data) =>{
        if(!err && data ){
              // hash the sent password and compare it to the password stored in the data object
              var hashedPassword  = helpers.hash(password)
              if(hashedPassword == data.password){
                  // if valida create a new token with random name, set expiration data 1 hour in future
                  var tokenId = helpers.createRandomString(20)
                  var expires = Date.now() + 1000 * 60 * 60
                  var tokenObject = {
                    phone,
                    tokenId,
                    expires
                  }
                   // store the token
                   _data.create('tokens', tokenId, tokenObject, (err) => {
                     if(!err){
                      callback(400,  {'error' : false, message: tokenObject})
                     }else{
                      callback(400,  {'error' : true, message: 'Could not create the new token'})
                     }
                   })
              }else{
                callback(400,  {'error' : true, message: 'Password did not match the specified users stored password'})
              }
              
        }else{
          callback(400,  {'error' : true, message: 'Could not find the specified user'})
        }
      })
   }else{
     callback(400,  {'error' : true, message: 'Missing querie field'})
   }
 }
/**
 *Tokens - GET
 Required data: id
 Optional data : none 
 * */
 handlers._tokens.get = (data, callback) => {
  var tokenId = typeof(data.queryStringObject.tokenId) == 'string' && data.queryStringObject.tokenId.length >= 2 ? data.queryStringObject.tokenId : false

  if(tokenId){
    _data.read('tokens', tokenId, (err, data) => {
     if(!err && data){
      callback(200,  {'error' : false, message: data})
        }else{
          callback(404, {'error' : true, message: 'The especified user does not exist'})
        }
    })
  }else{
    callback( 400, {'error' : true, message: 'Missing querie field'})
  }
 }

 /**
  *TOKENS - PUT
   Required data: id, extend
   Optional data :none 
  */
 handlers._tokens.put = (data, callback) => {
  var tokenId = typeof(data.payload.tokenId) == 'string' && data.payload.tokenId.length >= 2 ? data.payload.tokenId : false
  var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend ? data.payload.extend : false
  if(tokenId && extend ){
    _data.read('tokens', tokenId, (err, data) => {
      if(!err && data){
        if(data.expires > Date.now()){
          data.expires = Date.now() + 1000 * 60 * 60;

          _data.update('tokens', tokenId, data, (err) => {
            if(!err){
              callback( 200, {'error' : false, message: data})
            }else{
              callback( 400, {'error' : true, message: 'Could not update token expiration'})
            }
          })
        }else{
          callback(404, {'error' : true, message: 'The token has already expired and cannot be extended'})
        }
         }else{
           callback(404, {'error' : true, message: 'The especified token does not exist'})
         }
     })
  }else{
    callback(400, {'error' : true, message: 'Missing querie field'})
  }
 }

 /**
  *TOKENS - DELETE
   Required data: id
   Optional data :none 
  */
 handlers._tokens.delete = (data, callback) => {
  var tokenId = typeof(data.queryStringObject.tokenId) == 'string' && data.queryStringObject.tokenId.length >= 2 ? data.queryStringObject.tokenId : false
  if(tokenId){
    _data.read('tokens', tokenId, (err, data) => {
     if(!err && data){
         _data.delete('tokens', tokenId, (err) => {
        if(!err){
          callback(404, {'error' : true, message: 'success deleted'})
        }else{
          callback(404, {'error' : true, message: 'Could not delete especified token'})
        }
      })
      }else{
          callback(404, {'error' : true, message: 'The especified user does not exist'})
      }
    })
   }else{
    callback( 400, {'error' : true, message: 'Missing querie field'})
  }
 }


 // verify if a given yoken id is currenty valid for a given user
 handlers.verifyToken = (id, phone, callback) => {
  _data.read('token', id , (err, tokenData) => {
    // check that the token is for the given user and has not expired
    if(!err && tokenData){
      if( tokenData.phone == phone && tokenData.expires > Date.now()){
        callback(true)
      }else{
        callback(false)
      }
    }else{
      callback(false)
    }
  })
 }

handlers.notFound = (data, callback)=> callback(400)


module.exports = handlers