//use require keyword to refer and use credentials module
const credentials = require("./credentials.js");

//export MongoDB URI with user credentials
module.exports = {
    database: 'mongodb://' + credentials.username +
    ':' + credentials.password + '@' + credentials.host + ':' + credentials.port + '/' + credentials.database  
}