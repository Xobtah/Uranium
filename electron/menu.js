const { Menu } = require('electron');

let isPlaying = true;

const template = [

    {
        label: 'File',
        submenu: [ {
            label: 'New',
            accelerator: 'CmdOrCtrl+N',
            click (item, focusedWindow) { focusedWindow.webContents.send('new'); }
        }, {
            type: 'separator'
        }, {
            label: 'Import'
        }, {
            type: 'separator'
        }, {
            label: 'Do things'
        } ]
    },

    {
        label: 'Edit',
        submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'pasteandmatchstyle' },
            { role: 'delete' },
            { role: 'selectall' }
        ]
    },

    {
        label: 'Add'
    },

    {
        label: 'Play/Stop',
        click (item, focusedWindow) {
            if (focusedWindow) {
                isPlaying = !isPlaying;
                focusedWindow.webContents.send('playStop', isPlaying);
            }
        }
    },

    {
        label: 'View',
        submenu: [ {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click (item, focusedWindow) { if (focusedWindow) focusedWindow.reload(); }
            }, {
                label: 'Toggle Developer Tools',
                accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
                click (item, focusedWindow) { if (focusedWindow) focusedWindow.webContents.toggleDevTools(); }
            },
            { type: 'separator' },
            { role: 'resetzoom' },
            { role: 'zoomin' },
            { role: 'zoomout' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    },

    { role: 'window', submenu: [ { role: 'minimize' }, { role: 'close' } ] },

    { role: 'help', submenu: [ { label: 'Learn More', /*click () { require('electron').shell.openExternal('http://electron.atom.io') }*/ } ] }
];

if (process.platform === 'darwin') {
    const name = app.getName();
    template.unshift({
        label: name,
        submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'services', submenu: [] },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideothers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    });
    // Edit menu.
    template[1].submenu.push(
        { type: 'separator' },
        { label: 'Speech', submenu: [ { role: 'startspeaking' }, { role: 'stopspeaking' } ] }
    );
    // Window menu.
    template[3].submenu = [
        { label: 'Close', accelerator: 'CmdOrCtrl+W', role: 'close' },
        { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
        { label: 'Zoom', role: 'zoom' },
        { type: 'separator' },
        { label: 'Bring All to Front', role: 'front' }
    ];
}

Menu.setApplicationMenu(Menu.buildFromTemplate(template));