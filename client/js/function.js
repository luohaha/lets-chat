function submit()
{
	var data = $("input#content").val();
	$("input#content").val('');
	socket.emit('message', {say : data, uname : name});
	var scrollDiv = $('#ChatRoom');
    	scrollDiv.scrollTop(scrollDiv[0].scrollHeight-100);
}
function getThing()
{
	name = $("input#firstname").val();
	roomName = $("input#secondname").val();
}
