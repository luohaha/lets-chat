/*
	服务端代码
	author : Yixin Luo
	date : 2015-3-14
	update : 2015-3-15
*/
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userNum = 0;
var Users = {};
app.get('/', function(req, res){
	res.redirect('http://localhost');
});

io.on('connection', function(socket){
	console.log("new login in!");
	socket.on('login', function(data){
		socket.name = data.username;
		console.log("登陆测试 ： "+socket.name);
		if (Users[data.username])
		//用户重新链接的情况
		{
			//Users[data.username] = 44;
			//userNum++;
			io.emit('welcome', {uname : data.username, unum : userNum, to : 'all', people : "Luo"});
			console.log("user's id = "+data.userid+" user's name = "+data.username);
		}
		else
		//新用户的情况
		{
			Users[data.username] = 44;
			userNum++;
			io.emit('welcome', {uname : data.username, unum : userNum, to : 'all'});
			console.log("user's id = "+data.userid+" user's name = "+data.username);
		}
	});
	//接受消息
	socket.on('message', function(data){
		io.emit('message', {say : data.say, uname : data.uname, to : 'all'});
		console.log(data.say);
	});
	//离线
	socket.on('disconnect', function(){
		console.log("old gay out!");
		userNum--;
		delete Users[socket.name];
		console.log("离线测试 ： "+socket.name);
		io.emit('leave', {uname : socket.name, unum : userNum, to : 'all'});
	});
});

http.listen(3000, function(){
	console.log("server on 3000 start!");
});
