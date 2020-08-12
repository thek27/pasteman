
const fs = require('fs')
const path = require('path')
const ncp = require('ncp').ncp
const fetch = require("node-fetch")
const { exec } = require('child_process')
const {app, BrowserWindow, Tray, Menu, screen, ipcMain} = require('electron')

require('electron-reload')(__dirname)

const debug = /--debug/.test(process.argv[2])

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let settings = null
const homeAppDir = app.getPath('home')+'/.pasteman'
// fs.rmdirSync(homeAppDir,{recursive:true})
if (!fs.existsSync(homeAppDir)) {
	fs.mkdirSync(homeAppDir)
	fs.copyFileSync(path.join(__dirname, '/commands.json'), homeAppDir+'/commands.json')
	const rawdata = fs.readFileSync(path.join(__dirname, '/settings.json'))
	settings = JSON.parse(rawdata)
	settings.commands.uri = homeAppDir+'/commands.json'
	fs.writeFileSync(homeAppDir+'/settings.json', JSON.stringify(settings,null,2))

	fs.mkdirSync(homeAppDir+'/targets')
	fs.readdirSync(path.join(__dirname, '/targets')).forEach(file => {
		if (file.indexOf('paste')>-1) {
			const src = path.join(__dirname, '/targets/'+file)
			const dst = homeAppDir+'/targets/'+file
			ncp(src,dst)
		}
	})
}

const getRemoteCommands = async url => {
	try {
		const response = await fetch(url)
		const json = await response.json()
		return json
	} 
	catch (error) {  
	}
}

ipcMain.on('get-commands', (event, arg) => {
	let rawdata = null
	if (settings==null) {
		rawdata = fs.readFileSync(homeAppDir+'/settings.json')
		settings = JSON.parse(rawdata)
	}
	if (settings.commands.source=='remote') {
		getRemoteCommands(settings.commands.uri).then(function(json) {
			event.returnValue = json
		})
		return
	}
	rawdata = fs.readFileSync(settings.commands.uri)
	const commands = JSON.parse(rawdata)
	event.returnValue = commands
	
})

ipcMain.on('system-call', (event, arg) => {
	exec(arg),(error, stdout, stderr) => {}
	event.returnValue = ''
})

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
