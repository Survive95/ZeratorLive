// Modules to control application life and create native browser window
const {app, BrowserWindow, Tray, Menu, nativeImage} = require('electron')
const { ipcMain } = require('electron/main')
const path = require('path')
const CP = require('child_process')

let mainWindow = null
let tray = null

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
}
else {
  app.on('second-instance', () => {})
}

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show : false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule : true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

  tray = new Tray(__dirname + '/src/build.ico')
  let contextMenu = Menu.buildFromTemplate([
    { label: 'ZeratorLive', enabled : false, icon : nativeImage.createFromPath(__dirname + '/src/build.ico').resize({width:16})},
    { type:'separator'},
    { label: 'Boutique', type: 'normal', click: () => CP.execSync('start https://boutiquezerator.com/') },
    { label: 'Twitch', type: 'normal', click: () => CP.execSync('start https://www.twitch.tv/zerator') },
    { label: 'Twitter', type: 'normal', click: () => CP.execSync('start https://twitter.com/ZeratoR') },
    { label: 'Youtube', type: 'normal', click: () => CP.execSync('start https://www.youtube.com/user/ZeratoRSC2') },
    { type:'separator'},
    { label: 'Quitter', type: 'normal', click: () => app.quit() }
  ])
  tray.setToolTip('ZeratorLive')
  tray.setContextMenu(contextMenu)
  tray.addListener('double-click', () => {
    CP.execSync('start https://www.twitch.tv/zerator')
  })


  ipcMain.on('game', (event, msg) => {
    tray.setToolTip(`ZeratoR joue à ${msg}`)
  })
  
  ipcMain.on('online', () => {
    tray.setImage(__dirname + '/src/online.png')
  })

  ipcMain.on('offline', () => {
    tray.setImage(__dirname + '/src/offline.png')
    tray.setToolTip('ZeratoR est hors ligne')
  })

  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.setAppUserModelId('ZeratorLive')

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
