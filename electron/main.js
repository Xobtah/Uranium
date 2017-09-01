const electron = require( 'electron' );
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
	let screenDimensions = electron.screen.getPrimaryDisplay().size;

	mainWindow = new BrowserWindow({
		width: screenDimensions.width * 0.75,
		height: screenDimensions.height * 0.75
	});
	mainWindow.webContents.openDevTools();
	mainWindow.setMenu(null);
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '..', 'public', 'index.html'),
		protocol: 'file:',
		slashes: true
	}));
	mainWindow.on('closed', function () {
		mainWindow = null;
	});
	//require('./menu');
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
