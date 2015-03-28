/*
	author : Yixin Luo
	date : 2015-3-11
	function : 数据库的链接和相关操作的模块
*/
var mysql = require('mysql');

//新建mysql操作模块对象
var Mysql = function(h, u, p, d) {
	//链接建立
	var connection = mysql.createConnection({
		host : h,
		port : 3306,
		user : u,
		password : p,
		database : d
	});

	//当服务器关闭时需要丢弃所有的表
	this.drop = function (){
		connection.connect();
		connection.query('delete from connection');
		connection.query('delete from room');
		connection.query('delete from person');
		connection.end();
	};
	
	//当有人加入时，需要进行以下的操作步骤：
	// if connection 不存在
	// then
	//1.if table person 不存在, then将person 插入table person
	//2.if table room 已经存在, then  personNum++, else 新建一个table room
	// else
	// 不作为
        this.come = function (person, room, callback, word, pack, send){
	//先建立链接
	connection.connect();
	
	connection.query('SELECT * FROM connection WHERE person=? AND room=?', [person, room], function(err, rows){
		
		console.log(rows);
		if (rows.length !== 0){
			// if (rows != null)
		//	connection.end();
		//	return callback(room);
			callback(room, word, pack, send);
		}
		else{
			connection.query(
	                  'INSERT INTO connection (person, room) VALUES (?, ?)', [person, room], function(err){
		           if (err)
			        console.log("insert into conn :"+err);
 	                });
			//1.
			connection.query('SELECT * FROM person WHERE name = ?',[person], function(err, rows){
			if (err)
				console.log("select from person :"+err);
			else{
				if (rows.length != 0){
					//console.log(rows);
				}//if
				else {
					//判断当table person 中没有 
				connection.query('INSERT INTO person (name) VALUES (?)',[person], function (err) {
				if (err)
					console.log("insert into person : "+err);
				});
				}
			}//else
		});
			//2.
			connection.query('SELECT * FROM room WHERE name = ? limit 1', [room], function(err, rows){
			if (err)
				console.log("select from room : "+err);
			else{
				console.log(rows);
				if (rows.length !== 0){
				var tmpnum = parseInt(rows[0].personNum) + 1;
				var tmpname = rows[0].name;
				console.log("a : "+tmpnum+" b : "+tmpname);
				connection.query('UPDATE room SET personNum = ? WHERE name = ?',[tmpnum, tmpname], function (err) {
					if (err)
						console.log("update room : "+err);
				});
			//	connection.end();
			//	return callback(room);
				callback(room, word, pack, send);
				}//if
			//当table room中存在时，update personNum+1
				else{
				
				//判断当table room 中没有 
				connection.query('INSERT INTO room (name, personNum) VALUES (?,?)',[room, 1], function (err) {
					if (err)
						console.log("insert into room : "+err);
				});
			//	connection.end();
				//return callback(room);
				callback(room, word, pack, send);
				}
			}//else
			
			});
		}
	});//connection.query
	
	};// function come

	///////////////////
	//当有人离开时，需要进行一下步骤:
	//1.将name 从 table person 中删除
	//2.查询room 中的personNum,为1则删除room, 否则personNum--
	//3.删除connection 中的(name, room)
	this.leave = function (person, room, callback, word, pack, send){
		connection.connect();
		//1.
		connection.query('DELETE FROM person WHERE name = ?', [person], function(err, res){
			if (err)
			console.log("delete from person err : "+err);
		});
		//2.
		connection.query('SELECT * FROM room WHERE name = ?', [room], function(err, rows){
			if (err)
			console.log("select from room err : "+err);
			else{
				if (rows[0].personNum == 1){
					connection.query('DELETE FROM room WHERE name = ?', [room], function(err, res){
						if (err)
							console.log("delete from room err : "+err);
					});
				}
				else{
					var numtmp = parseInt(rows[0].personNum) - 1;
					var nametmp = rows[0].name;
					connection.query('UPDATE room SET personNum = ? WHERE name = ?', [numtmp, nametmp], function(err, res){
						if (err)
						console.log("update room err : "+err);
					});
				}
			}
		});
		//3.
		connection.query('DELETE FROM connection WHERE person = ? AND room = ?', [person, room], function(err,res){
			if (err)
				console.log("delte from connection err : "+err);
			callback(room, word, pack, send);
			//connection.end();
		});
		
	};

	//读取对应房间中的人
	this.read = function (room, word, pack, send){
		//connection.connect();
		connection.query('SELECT person FROM connection WHERE room = ?', [room], function (err, rows){
			if (err)
				console.log("select person from conn err : "+err);
			else{
				console.log("qnmaaaab: ->"+rows);
				console.log(rows);
				pack.result = rows;
				send.emit(word,pack);
				connection.end();
				return rows;
			}
		});
	};
	//读取房间内的人数
	this.count = function (room){
		connection.connect();
		connection.query('SELECT personNum FROM room WHERE name = ?', [room], function (err, rows){
			if (err)
				console.log("select personnum from room err : "+err);
			else{
				connection.end();
				return rows[0];
			}
		});
		connection.end();
	}


};//Mysql 对象

module.exports = Mysql;
