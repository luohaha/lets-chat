function submit()
{
	var data = $("input#content").val();
	$("input#content").val('');
	socket.emit('message', {say : data, uname : name});
}
function offline()
{
	socket.emit('disconnect', {uname : name});
}
