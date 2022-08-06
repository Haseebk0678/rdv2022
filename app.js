const express=require('express');
const socketIO=require('socket.io');
const http=require('http')
const port=process.env.PORT||3000
var app=express();
let server = http.createServer(app);
var io=socketIO(server);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`)
})
// make connection with user from server side
io.on('connection', (socket)=>{
console.log('New user connected');
//emit message from server to user
socket.emit('newMessage', {
	from:'jen@mds',
	text:'hepppp',
	createdAt:123
});

// listen for message from user
socket.on('createMessage', (newMessage)=>{
	console.log('newMessage', newMessage);
});

// when server disconnects from user
socket.on('disconnect', ()=>{
	console.log('disconnected from user');
});
});

server.listen(port);
