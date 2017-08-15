window.URL = window.URL || window.webkitURL;
window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;

Number.prototype.format = function () { return (this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")); };

let config = {
    content: [ {
        type: 'row',
        content:[ {
            type: 'component',
            componentName: 'Scene',
            componentState: {  }
        }, {
            type: 'column',
            content:[ {
                type: 'component',
                componentName: 'Sidebar',
                componentState: {  }
            }/*,{
                type: 'component',
                componentName: 'testComponent',
                componentState: {  }
            }*/ ]
        } ]
    } ]
};
let layout = new GoldenLayout(config);
let editor = new Editor();
let script = new Script(editor);
let toolbar = new Toolbar(editor);
let menubar = new Menubar(editor);
let modal = new UI.Modal(editor);

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
    signals.showModal.add((content) => modal.show(content));
});

//

document.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}, false);

document.addEventListener('drop', (event) => {
    event.preventDefault();
    if (event.dataTransfer.files.length > 0)
        editor.loader.loadFile( event.dataTransfer.files[0]);
}, false);

document.addEventListener('keydown', (event) => {
    switch (event.keyCode) {
        case 8: // backspace
            event.preventDefault(); // prevent browser back
        case 46: // delete
            let object = editor.selected;
            if (confirm('Delete ' + object.name + '?') === false)
                return ;
            let parent = object.parent;
            if (parent !== null) editor.execute(new RemoveObjectCommand(object));
            break;
        case 90: // Register Ctrl-Z for Undo, Ctrl-Shift-Z for Redo
            if (event.ctrlKey && event.shiftKey)
                editor.redo();
            else if (event.ctrlKey)
                editor.undo();
            break;
        case 87: // Register W for translation transform mode
            editor.signals.transformModeChanged.dispatch('translate');
            break;
        case 69: // Register E for rotation transform mode
            editor.signals.transformModeChanged.dispatch('rotate');
            break;
        case 82: // Register R for scaling transform mode
            editor.signals.transformModeChanged.dispatch('scale');
            break;
    }
}, false);

function onWindowResize(event) {
    editor.signals.windowResize.dispatch();
}

window.addEventListener('resize', onWindowResize, false);

onWindowResize();

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
    container.on('resize', () => editor.signals.windowResize.dispatch());
    let viewport = new Viewport(editor, container.getElement()[0]);
    //let player = new Player(editor, container.getElement()[0]);
    container.getElement().append(viewport.dom);
    //container.getElement().append(player.dom);
});
layout.registerComponent('Sidebar', function (container, componentState) {
    let sidebar = new Sidebar(editor, container.getElement()[0]);
    container.getElement().append(sidebar.dom);
});

layout.init();