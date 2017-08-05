const electron = require( 'electron' );
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({ webPreferences: { nodeIntegration: false }, width: 1440, height: 900 });
	//mainWindow.webContents.openDevTools();
	mainWindow.setMenu(null);
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));

	mainWindow.on('closed', function () {
		mainWindow = null;
	});
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
	if ( process.platform !== 'darwin' )
		app.quit();
});

app.on('activate', function () {
	if (!mainWindow)
		createWindow();
});
