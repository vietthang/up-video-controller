const { app, BrowserWindow } = require('electron')

let mainWindow

// console.log(chrome)
console.log(require('electron'))

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 720,
    width: 960,
    frame: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      nativeWindowOpen: true,
    },
  })

  mainWindow.webContents.on(
    'new-window',
    (event, url, frameName, disposition, options, additionalFeatures) => {
      event.preventDefault()
      Object.assign(options, {
        frame: false,
        modal: false,
      })
      event.newGuest = new BrowserWindow(options)
    },
  )

  const controllerUrl = new URL('http://localhost:3000')
  mainWindow
    .loadURL(controllerUrl.toString())
    .catch(error => console.error(error))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
