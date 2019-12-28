const electron = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

const { app,BrowserWindow,Menu } = electron;

let mainWindow;


function init(){
  mainWindow = new BrowserWindow({
    icon:path.join(__dirname,'icon/music_1.jpg'),
    width: 800,
    height: 500,
    minWidth: 800,
    minHeight: 500,
    webPreferences:{
      nodeIntegration:true
    }
  });
  if(isDev){
    // dev tools
    mainWindow.webContents.openDevTools();

    mainWindow.loadFile(path.join(__dirname,'home/index.html'));
  }else{
    mainWindow.loadFile(path.join(__dirname,'home/index.html'));
  }
  // menu
  const menu = [
    {
      label:'File',
      submenu:[
        {
          label:'Open File',
          click(){
            mainWindow.webContents.send('open-file');
          }
        },
        {
          label:'Open Folder',
          click(){
            mainWindow.webContents.send('open-folder');
          }
        },
        {
          label:'Exit',
          accelerator:'Ctrl+Q',
          click(){
            app.quit();
          }
        }
      ]
    },
    {
      label:'View',
      submenu:[
        {role:'reload'},
        {role:'toggledevtools'}
      ]
    }
  ];
  // build menu
  const buildMenu = Menu.buildFromTemplate(menu);
  // set menu
  Menu.setApplicationMenu(buildMenu);

}


// app ready
app.on('ready',init);