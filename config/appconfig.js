var dbconfig = {};

var redis = {};

var config = {}

dbconfig.host = '45.77.22.61';
dbconfig.user = 'maldini';
dbconfig.password = 'tjalswns#14rlaalsgh#16';
dbconfig.database = 'fishing_reservation';
dbconfig.port = 5306

// redis.host = 'hashkorea.myds.me'
// redis.port = '32815'

config.dbconfig = dbconfig
config.redis = redis

// var mongodb = {};
// mongodb.host = "45.77.22.61"
// mongodb.id = "fishwang_log_manager"
// mongodb.pw = "fffiiissshhh#1416"
// mongodb.dbname = "fishwang_db"
// mongodb.port = 4788
// // Connection URL
// mongodb.url = `mongodb://${mongodb.id}:${mongodb.pw}@${mongodb.host}:${mongodb.port}/${mongodb.dbname}`
// config.mongodb = mongodb;

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

module.exports = config;
