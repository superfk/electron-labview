let socket = require('socket.io-client')('http://127.0.0.1:5678/test',{transports:['websockets']});
let moment = require('moment');

socket.on('connect', function(){
    console.log('connected')
    socket.emit('my_msg', 'world');
});
socket.on('my_message', function(data){
    console.log(data)
});
socket.on('disconnect', function(){
    console.log('disconnected')
});

let sending = setTimeout(()=>{
    socket.emit('my_msg', moment());
},1000);