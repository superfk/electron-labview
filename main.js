const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const {ipcMain, dialog, shell, webFrame} = require('electron')
const appRoot = require('electron-root-path').rootPath;
var fs = require('fs');
const ProgressBar = require('electron-progressbar');


let todayState = {};
let emaillist ='';
let enable_send_mail = false;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let manage_win

/*************************************************************
 * lv process
 *************************************************************/

const LV_DIST_FOLDER = 'lvapi_dist'
const LV_FOLDER = 'lvapi'
const LV_MODULE = 'lvapi' // without .py suffix
let LV_INIT_OK = false;

let lvProc = null
let lvPort = 6123
let isProdct = false

//
const guessPackaged = () => {
  const fullPath = path.join(appRoot, LV_DIST_FOLDER)
  return require('fs').existsSync(fullPath)
}

const getScriptPath = () => {
  if (!guessPackaged()) {
    return path.join(appRoot, LV_FOLDER, LV_MODULE + '.vi')
  }
  if (process.platform === 'win32') {
    console.log(path.join(appRoot, LV_DIST_FOLDER, LV_MODULE, LV_MODULE + '.exe'));
    return path.join(appRoot, LV_DIST_FOLDER, LV_MODULE, LV_MODULE + '.exe')
  }
  return path.join(appRoot, LV_DIST_FOLDER, LV_MODULE, LV_MODULE)
}

const selectPort = () => {
  lvPort = 6123
  return lvPort
}

const createlvProc = () => {
  let script = getScriptPath()
  let port = '' + selectPort()

  if (guessPackaged()) {
    lvProc = require('child_process').execFile(script, [port])
    console.log(script);
  } else {
    console.log(script)
    lvProc = require('child_process').exec(script, [port])
    // lvProc = require('child_process').spawn(script)
    // var batchFile = path.join(__dirname, LV_FOLDER,'start_python_server.bat')
    // var bat = shell.openItem(batchFile);
    // console.log(bat)
  }
 
  if (lvProc != null) {
    console.log('child process success on port ' + port);
    setTimeout(()=>{
      init_server();
    }, 10)
    

  }
}

const exitlvProc = () => {
  lvProc.kill();
}

// init config and database
var init_server = function(){
  LV_INIT_OK = true;
  createWindow();
}


app.on('ready', createlvProc)
app.on('will-quit', function(event){
  exitlvProc;
  if (enable_send_mail){
    event.preventDefault();
  } 

} )

/*************************************************************
 * window management
 *************************************************************/

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
      
    }
  })

  mainWindow.maximize()

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')
  mainWindow.loadURL(require('url').format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}


// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

let progressBar = null;

ipcMain.on('setProgBar', (event, title, msg)=>{
  console.log(title);
  console.log(msg);
  if(progressBar===null){
    progressBar = new ProgressBar({
      text: title,
      detail: msg,
      browserWindow: {
              webPreferences: {
                  nodeIntegration: true
              }
          }
      });
      
    progressBar
    .on('completed', function() {
        console.info(`completed...`);
        progressBar.detail = '完成';
    })
    .on('aborted', function() {
        console.info(`aborted...`);
    });
  }
  
})

ipcMain.on('closeProgBar', (event)=>{
  try{
    progressBar.setCompleted();
    progressBar=null;
  }catch{

  }finally{
    progressBar=null;
  }
  
})
