window.URL = window.URL || window.webkitURL;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

Number.prototype.format = function () { return (this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")); };

console.notification = function (initMessage) {
    let start = performance.now();

    return ({
        exec: function (execMessage) {
            console.log('[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']', execMessage || initMessage || '' + ' ' + (performance.now() - start).toFixed(2) + 'ms');
        }
    });
};

let config = {
    content: [ {
        type: 'row',
        content: [ {
            type: 'row',
            content: [ {
                type: 'component',
                componentName: 'Project',
                componentState: {  },
                width: 15
            }, {
                type: 'column',
                content: [ {
                    type: 'component',
                    componentName: 'Scene',
                    componentState: {  }
                }, {
                    type: 'component',
                    componentName: 'Game',
                    componentState: {  }
                } ]
            } ]
        }, {
            type: 'component',
            componentName: 'Sidebar',
            componentState: {  },
            width: 20
        } ]
    } ]
};
let layout = new GoldenLayout(config);
let editor = new Editor();
let menubar = new Menubar(editor);

document.body.append(menubar.dom);

editor.setTheme(editor.config.getKey('theme'));

editor.storage.init(() => {
    editor.storage.get((state) => {
        if (isLoadingFromHash)
            return ;
        if (state !== undefined)
            editor.fromJSON(state);
        let selected = editor.config.getKey('selected');
        if (selected !== undefined)
            editor.selectByUuid(selected);
    });

    //

    let timeout;

    // TODO: Make the rigidbodies to save
    function saveState(scene) {
        if (editor.config.getKey('autosave') === false)
            return ;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            editor.signals.savingStarted.dispatch();
            timeout = setTimeout(() => {
                editor.storage.set(editor.toJSON());
                editor.signals.savingFinished.dispatch();
            }, 100);
        }, 1000);
    }

    let signals = editor.signals;

    signals.geometryChanged.add(saveState);
    signals.objectAdded.add(saveState);
    signals.objectChanged.add(saveState);
    signals.objectRemoved.add(saveState);
    signals.materialChanged.add(saveState);
    signals.sceneBackgroundChanged.add(saveState);
    signals.sceneFogChanged.add(saveState);
    signals.sceneGraphChanged.add(saveState);
    signals.scriptChanged.add(saveState);
    signals.historyChanged.add(saveState);
});

//

document.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}, false);

document.addEventListener('drop', (event) => {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0)
        editor.loader.loadFile(event.dataTransfer.files[0]);
}, false);

document.addEventListener('keydown', (event) => {
    switch (event.keyCode) {
        case 8: // backspace
            //event.preventDefault(); // prevent browser back
        case 46: // delete
            let object = editor.selected;
            if (object && confirm('Delete ' + object.name + '?')) {
                let parent = object.parent;
                if (parent !== null)
                    editor.execute(new RemoveObjectCommand(object));
            }
            break;
        case 90: // Register Ctrl-Z for Undo, Ctrl-Shift-Z for Redo
            if (event.ctrlKey && event.shiftKey)
                editor.redo();
            else if (event.ctrlKey)
                editor.undo();
            break;
        /*case 87: // Register W for translation transform mode
            editor.signals.transformModeChanged.dispatch('translate');
            break;
        case 69: // Register E for rotation transform mode
            editor.signals.transformModeChanged.dispatch('rotate');
            break;
        case 82: // Register R for scaling transform mode
            editor.signals.transformModeChanged.dispatch('scale');
            break;*/
        case 80: // Register Ctrl+P for Play/Pause
            if (event.ctrlKey) {
                event.preventDefault();
                let playStopDiv = $('#playStopButton');
                if (playStopDiv.text() === 'Play')
                    editor.signals.startPlayer.dispatch();
                else if (playStopDiv.text() === 'Stop')
                    editor.signals.stopPlayer.dispatch();
            }
            break;
    }
}, false);

//

let isLoadingFromHash = false;
let hash = window.location.hash;

if (hash.substr(1, 5) === 'file=') {
    let file = hash.substr(6);
    if (confirm('Any unsaved data will be lost. Are you sure?')) {
        let loader = new THREE.FileLoader();
        loader.crossOrigin = '';
        loader.load(file, (text) => {
            editor.clear();
            editor.fromJSON(JSON.parse(text));
        });
        isLoadingFromHash = true;
    }
}

/*window.addEventListener('message', function (event) {
    editor.clear();
    editor.fromJSON(event.data);
}, false);*/

// VR

let groupVR;

editor.signals.enterVR.add(() => {
    if (groupVR === undefined) {
        groupVR = new THREE.HTMLGroup(viewport.dom);
        editor.sceneHelpers.add( groupVR );

        let mesh = new THREE.HTMLMesh(sidebar.dom);
        mesh.position.set(15, 0, 15);
        mesh.rotation.y = - 0.5;
        groupVR.add(mesh);

        let signals = editor.signals;

        function updateTexture() {
            mesh.material.map.update();
        }

        signals.objectSelected.add(updateTexture);
        signals.objectAdded.add(updateTexture);
        signals.objectChanged.add(updateTexture);
        signals.objectRemoved.add(updateTexture);
        signals.sceneGraphChanged.add(updateTexture);
        signals.historyChanged.add(updateTexture);
    }
    groupVR.visible = true;
});

editor.signals.exitedVR.add(() => {
    if (groupVR !== undefined)
        groupVR.visible = false;
});

layout.registerComponent('Scene', function (container, componentState) {
    new Viewport(editor, container);
});
layout.registerComponent('Game', function (container, componentState) {
    new Player(editor, container);
});
layout.registerComponent('Sidebar', function (container, componentState) {
    container.layoutManager.eventHub.on('openScript', (object, script) => {
        layout.root.contentItems[0].addChild({
            type: 'component', componentName: 'Script',
            componentState: { object: object, script: script }
        }, 0);
        container.layoutManager.eventHub.emit('editScript', object, script);
    });
    new Sidebar(editor, container);
});
layout.registerComponent('Script', function (container, componentState) {
    new Script(editor, container);
});
layout.registerComponent('Project', function (container, componentState) {
    container.getElement().html('<div id="jstree" style="background: initial"></div>');
    new Project(editor, container);
});

layout.init();
