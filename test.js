var Mysql = require('./database');
var db = new Mysql('localhost','root','85701411','lets_chat');

//db.drop();
db.leave('luo2','123');
//db.come('luo1','123');
//db.come('luo2','123');
console.log('hello mysql!');
