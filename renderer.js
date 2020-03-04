const { ipcRenderer } = require('electron');
const app = require('electron').remote.app;
const path = require('path');
const appRoot = app.getAppPath();
var moment = require('moment');
var systime_hook = document.getElementById('systime');
let tools = require('./js/shared_tools');
let ws;

let connText = document.getElementById('connIndicator')
let serverTimeInd= document.getElementById('serverTimeIndicator')
let serverAPIInd = document.getElementById('serverAPIs')
let cmdInput = document.getElementById('cmdInput')
let textInput = document.getElementById('textInput')
let serverDataIndicator = document.getElementById('serverDataIndicator')
let showDataBtn = document.getElementById('showDataBtn')



// **************************************
// websocket functions
// **************************************
function connect() {
  try{
    const WebSocket = require('ws');
    ws = new WebSocket('ws://127.0.0.1:6123');
  }catch(e){
    console.log('Socket init error. Reconnect will be attempted in 1 second.', e.reason);
  }

  ws.on('open', function open() { 
    console.log('websocket in renderer connected')
    handleConn(true);
  });

  ws.on('message', function incoming(message) {

    try{
      
      msg = tools.parseServerMessage(message);
      let cmd = msg.cmd;
      let data = msg.data;
      let dtype = msg.dtype;
      switch(cmd) {
        case 'getServerAPI':
          showServerAPIs(data)
          break;
        case 'fromServerData':
          console.log(data)
          serverDataIndicator.innerText = data;
          break;
        case 'serverTime':
          serverTimeInd.innerText = data;
          break;
        case 'showImg':
          showImg(data)
          break;
        default:
          console.log('Not found this cmd' + cmd)
          break;
      }
    }catch(e){
      console.error(e)
    }
    
  });

  ws.onclose = function(e) {
    console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
    setTimeout(function() {
      connect();
    }, 1000);
    handleConn(false);
  };

  ws.onerror = function(err) {
    console.error('Socket encountered error: ', err.message, 'Closing socket');
    ws.close();
    handleConn(false);
    
  };
}

connect()

// **************************************
// listener functions
// **************************************

showDataBtn.addEventListener('click', ()=>{
  let cmd  = cmdInput.value;
  let data = textInput.value;
  ws.send(tools.parseCmd(cmd,data));
})

// **************************************
// general functions
// **************************************
function handleConn(conn=false){
  if (conn){
    connText.classList.remove('connOK','connNG');
    connText.classList.add('connOK');
    connText.innerText = 'connected'
  }else{
    connText.classList.remove('connOK','connNG');
    connText.classList.add('connNG')
    connText.innerText = 'disconnected'
  }
}

function showServerAPIs(api){
  let apiString = api.split(',');
  let apiList = ''
  apiString.forEach((value,index)=>{
    apiList += `<li>${value}</li>`
  })
  serverAPIInd.innerHTML = apiList;
}

function showImg(data){
  serverDataIndicator.innerHTML = '';
  let img = document.createElement('img');
  img.src = 'data:image/jpg;base64,'+ data;
  serverDataIndicator.appendChild(img);
}