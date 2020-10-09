/**
 * Create and export configuration variables
 */

const { env } = require("process")

 // Container for all the environments
 var environments = {}

 // staginfg ( default ) environment
 environments.staging = {
    'httpPort' : 5000,
    'httpsPort' : 5051,
    'envName' : 'staging',
    'hashingSecret' : 'P@u10'
 }

 // production environment 
 environments.production = {
    'httpPort' : 6000,
    'httpsPort' : 6001,
    'envName' : 'production',
    'hashingSecret' : 'P@u10'
 }

 // determine wich environment was passed as a command-line argument
 var currentEnvironment = typeof( process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLocaleLowerCase() :  ''

 // check that the current environment is one of the environments above, if no, default to staging
 var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging

 module.exports = environmentToExport