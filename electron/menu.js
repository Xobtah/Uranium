const { Menu } = require('electron');

let isPlaying = false;

let template = [

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
        label: 'Add',
        submenu: [
            {
                label: 'Group',
                click(item, focusedWindow) { focusedWindow.webContents.send('add', 'Group') }
            },
            { type: 'separator' },
            {
                label: 'Plane',
                click(item, focusedWindow) { focusedWindow.webContents.send('add', 'Plane') }
            },
            {
                label: 'Box',
                click(item, focusedWindow) { focusedWindow.webContents.send('add', 'Box') }
            },
            {
                label: 'Sphere',
                click(item, focusedWindow) { focusedWindow.webContents.send('add', 'Sphere') }
            }
        ]
    },

    {
        label: 'Play',
        accelerator: 'CmdOrCtrl+P',
        click (item, focusedWindow) {
            isPlaying = !isPlaying;
            focusedWindow.webContents.send('playStop', isPlaying);
            setMenu();
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

    {
        role: 'window',
        submenu: [
            {
                label: 'Open Component',
                submenu: [
                    { label: 'Scene', click(item, focusedWindow) { focusedWindow.webContents.send('openComponent', 'Scene'); } },
                    { label: 'Game', click(item, focusedWindow) { focusedWindow.webContents.send('openComponent', 'Game'); } },
                    { label: 'Sidebar', click(item, focusedWindow) { focusedWindow.webContents.send('openComponent', 'Sidebar'); } },
                    { label: 'Script', click(item, focusedWindow) { focusedWindow.webContents.send('openComponent', 'Script'); } }
                ]
            },
            { type: 'separator' },
            { role: 'minimize' },
            { role: 'close' }
        ]
    },

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

function setMenu() {
    template.forEach((menuItem) => {
        if (menuItem.label === 'Play' && isPlaying)
            menuItem.label = 'Stop';
        else if (menuItem.label === 'Stop' && !isPlaying)
            menuItem.label = 'Play';
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

setMenu();