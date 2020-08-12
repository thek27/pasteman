
const path = require('path')
const {app, BrowserWindow, Tray, Menu, screen} = require('electron')

require('electron-reload')(__dirname)

const debug = /--debug/.test(process.argv[2])

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let mainWindow = null
let appIcon = null

function initialize () {
  makeSingleInstance()

  function createWindow () {
	const display = screen.getPrimaryDisplay()
	const width = display.bounds.width
	const height = display.bounds.height
    const windowOptions = {
	  width: 300,
	  minWidth: 200,
      maxWidth: 400,
	  height: height,
	  minHeight: 200,
	  x: width - 310,
	  y: 0,
	  fullscreenable: false,
	  maximizable: false,
	  minimizable: false,
      webPreferences: {	
      	nodeIntegration: true
      }
    }

    if (process.platform === 'linux') {
      windowOptions.icon = path.join(__dirname, '/assets/app-icon/png/512.png')	
    }

    mainWindow = new BrowserWindow(windowOptions)
	mainWindow.loadURL(path.join('file://', __dirname, '/index.html'))
	mainWindow.setMenu(null)

	appIcon = new Tray(path.join(__dirname, '/assets/app-icon/png/24.png'))
	var contextMenu = Menu.buildFromTemplate([
		{ label: 'Show', click:  function(){
			mainWindow.show()
		} },
		{ label: 'Quit', click:  function(){
			app.isQuiting = true
			app.quit()
		} }
	])
	appIcon.setContextMenu(contextMenu)

    if (debug) {
		mainWindow.webContents.openDevTools({mode: 'undocked'})
    }

    mainWindow.on('close', function (event) {
		if(!app.isQuiting) {
			event.preventDefault()
			mainWindow.hide()
		}
		return false
	})
	
	mainWindow.on('minimize', function (event) {
		event.preventDefault()
		mainWindow.hide()
	})
	
  }

  app.on('ready', () => {
    createWindow()
  })

  app.on('window-all-closed', () => {
	if (appIcon) appIcon.destroy()
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow()
    }
  })
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
  app.requestSingleInstanceLock()
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

initialize()
