// Library fo storing and editing data

// Dependencies
var fs = require('fs')
var path = require('path')
const helpers = require('./helpers')


// container for the module (to be exported)
var lib = {}

// base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/')

// write data to a file
lib.create = function(dir, file, data, callback){
  // open the file fo writing
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', function(err, fileDescriptior){
    if(!err && fileDescriptior){
      // convert data to string 
      var stringData = JSON.stringify(data)
      //write to file and close it
      fs.writeFile(fileDescriptior, stringData, function(err){
        if(!err){
            fs.close(fileDescriptior, function(err){
              if( !err ){
                  callback(false)
              }else{
                callback('Error closing the new  file')  
              }
            })
        }else{
            callback('Error writing to new file')    
        }
      })
    }else{
      callback('Could not create a new file, it may already exist')
    }
  })
}


// Read data from a file
lib.read = function(dir, file, callback){
  fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf-8', function(err, data){
    if(!err){
      var parsedData = helpers.parseJsonPayloadToObject(data)
      return callback(false, parsedData)
    }
     callback(err, data)
  })
}

// update data from a file
lib.update = function(dir, file, data, callback){
  fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', function(err, fileDescriptior){
    if(!err && fileDescriptior){
      var stringData = JSON.stringify(data)
      // truncate the file
      fs.truncate(fileDescriptior, function(err){
        if(!err){
            fs.writeFile(fileDescriptior, stringData, function(err){
              if(!err){
                fs.close(fileDescriptior, function(err){
                  if( !err ){
                      callback(false)
                  }else{
                    callback('Error closing  file')  
                  }
                })
              }else{
                callback('Error writing existing file')
              }
            })
        }else{
          callback('Error truncating file')
        }
      })
    }else{
      callback('Could not open the file fo updating, it may not exist yet')
    }
  })
}

// delete a file
lib.delete = function(dir, file, callback){
  // unlik file
  fs.unlink(`${lib.baseDir}${dir}/${file}.json`, function(err){
    if(!err){
      callback(false)
    }else{
      callback('Error deketing file')
    }
  })
}

// expport the module
module.exports = lib