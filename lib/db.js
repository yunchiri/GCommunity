const appconfig = require('../config/appconfig')
const mysql = require('mysql2/promise');
// create the pool
var pool;
exports.pool = function() {
    if (pool) return pool;
    
    pool = mysql.createPool({
      host: appconfig.dbconfig.host,
      user: appconfig.dbconfig.user,
      password: appconfig.dbconfig.password,
      database: appconfig.dbconfig.database,
      waitForConnections: true,
      port: appconfig.dbconfig.port,
      connectionLimit: 5,
      namedPlaceholders : true
    })

    return pool
}


//https://github.com/sidorares/node-mysql2/blob/master/documentation/Promise-Wrapper.md