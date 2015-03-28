/*
	name: lets-chat
	version : v0.0.1
	服务端代码
	author : Yixin Luo
	date : 2015-3-14
	update : 2015-3-16
	更新多房间的功能
	全局：
		userNum 记录对应的房间的人数
		Users   记录在线的所有用户信息，用魔数44标记
	消息：
		connection : 当客户链接上时触发，记录用户姓名和房间名称，更新userNum中的人数
			    并向房间中成员广播欢迎消息，更新房间的对应人数
		message : 接受客户端发送的消息，并广播到对应的房间
		disconnect : 接受客户端的离线消息

	未完成：
		房间内人员姓名的更新
		完善前端
*/
var Mysql = require('./database');
var express = require('express');
var path = require('path');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var userNum = {};//对应房间的人数
var Users = {};
app.use(express.static(path.join(__dirname, 'client')));
app.get('/', function(req, res){
	//res.redirect('/client/index.html');
	res.render('index');
});
//丢弃旧的数据库
var db = new Mysql('localhost','root','85701411','lets_chat');
db.drop();

io.on('connection', function(socket){
	console.log("new login in!");
	socket.on('login', function(data){
		//加入对应的房间
		socket.join(data.room);
		/////登记客户端socket对应的名字和房间号
		socket.name = data.username;
		socket.room = data.room;
		console.log("登陆测试 ： "+socket.name);
		if (Users[data.username])
		//用户重新链接的情况
		{
			//Users[data.username] = 44;
			//userNum++;
			var db = new Mysql('localhost','root','85701411','lets_chat');
			var send = io.in(data.room);
			db.come(data.username, data.room, db.read, 'welcome', {uname : data.username, unum : userNum[data.room], result : ''}, send);
			//io.in(data.room).emit('welcome', {uname : data.username, unum : userNum[data.room], result : res});
			console.log("user's room = "+data.room+" user's name = "+data.username);
		}
		else
		//新用户的情况
		{
			var db = new Mysql('localhost','root','85701411','lets_chat');
			//存入数据库
			var send = io.in(data.room);
			
			Users[data.username] = 44;
			//首先要判断对应房间的人数是否存在
			if (userNum[socket.room])
			{
				userNum[socket.room]++;
			}
			else
			{
				userNum[socket.room] = 1;
			}
			db.come(data.username, data.room, db.read, 'welcome', {uname : data.username, unum : userNum[data.room], result : ''},send);
	//		io.in(data.room).emit('welcome', {uname : data.username, unum : userNum[data.room], result : res});
			console.log("user's id = "+data.userid+" user's name = "+data.username);
		}
	});
	//接受消息
	socket.on('message', function(data){
		//io.in()用于发送给在指定房间内的客户
		io.in(socket.room).emit('message', {say : data.say, uname : data.uname, to : 'all'});
		console.log(data.say);
	});
	//离线
	socket.on('disconnect', function(){
		console.log("old gay out!");
		userNum[socket.room]--;
		delete Users[socket.name];
		//离开对应的房间
		var db = new Mysql('localhost','root','85701411','lets_chat');
		//删除数据库对应用户
		var send = io.in(socket.room);
		db.leave(socket.name, socket.room, db.read, 'leave', {uname : socket.name, unum : userNum[socket.room], result : ''}, send);
		socket.leave(socket.room);
		console.log("离线测试 ： "+socket.name);
		//io.in(socket.room).emit('leave', {uname : socket.name, unum : userNum[socket.room], result : res});
	});
});

http.listen(3000, function(){
	console.log("server on 3000 start!");
});
