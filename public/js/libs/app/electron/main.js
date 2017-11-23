require('fs').readFile('package.json', (err, data) => {
	require('../' + JSON.parse(data).name);
});

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

let mainWindow = null;

function createWindow() {
	let screenDimensions = electron.screen.getPrimaryDisplay().size;

	mainWindow = new BrowserWindow({
		width: screenDimensions.width * 0.25,
		height: screenDimensions.height * 0.25,
		webPreferences: {
            webSecurity: false,
            webgl: true
        }
	});
	mainWindow.setMenu(null);
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, '..', 'index.html'),
		protocol: 'file:',
		slashes: true
	}));
	mainWindow.on('closed', function () {
		mainWindow = null;
	});
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin')
		app.quit();
});

app.on('activate', function () {
	if (!mainWindow)
		createWindow();
});
