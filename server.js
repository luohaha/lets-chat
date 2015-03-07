var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userNum = 0;
app.get('/', function(req, res){
	//res.render('index',{});
});

io.on('connection', function(socket){
	console.log("new login in!");
	socket.on('login', function(data){
		userNum++;
		io.emit('welcome', {uname : data.username, unum : userNum});
		console.log("user's id = "+data.userid+" user's name = "+data.username);
	});
	//接受消息
	socket.on('message', function(data){
		io.emit('message', {say : data.say, uname : data.uname});
		console.log(data.say);
	});
	//离线
	socket.on('disconnection', function(data){
		console.log("old gay out!");
		userNum--;
		io.emit('leave', {uname : data.uname, unum : userNum});
	});
});

http.listen(3000, function(){
	console.log("server on 3000 start!");
});
