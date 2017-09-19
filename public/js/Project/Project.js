/**
 * Created by xobtah on 03/09/17.
 */

let Project = function (editor, container) {
    let jstreeDiv = null;
    let jstreeTheme = null;

    switch (editor.config.getKey('theme')) {
        case 'css/light.css':
            jstreeTheme = 'default';
            break;
        case 'css/dark.css':
            jstreeTheme = 'default-dark';
            break;
        default:
            jstreeTheme = 'default';
            break;
    }

    $(container.getElement()).ready(() => {
        jstreeDiv = $('#jstree');

        jstreeDiv.jstree({
            core: {
                themes: {
                    name: jstreeTheme,
                    dots: true,
                    icons: true
                },
                data: {
                    url: function (node) {
                        return ('/api/assets');
                    },
                    data: function (node) {
                        return ({ path: node.id === '#' ? 'Test' : node.id });
                    }
                },
                check_callback: true // For contextmenu to work
            },
            contextmenu: { items: Project.ContextMenu },
            plugins: [ 'contextmenu', 'dnd' ]
        });

        // Websocket's fileSystem signal
        socket.on('fileSystem', (data) => {
            switch (data.type) {

                case 'POST':
                    if (!jstreeDiv.jstree(true).get_node(data.path)) {
                        let parent = data.path.substr(0, data.path.lastIndexOf('/'));
                        let name = data.path.substr(data.path.lastIndexOf('/') + 1, data.path.length);

                        jstreeDiv.jstree(true).create_node(parent, {
                            text: name, id: data.path, icon: data.isDir ? 'jstree-folder' : 'jstree-file'
                        });
                    }
                    break;

                case 'PUT':
                    let oldParent = data.path.substr(0, data.path.lastIndexOf('/'));
                    let newParent = data.new.substr(0, data.new.lastIndexOf('/'));
                    let newName = data.new.substr(data.new.lastIndexOf('/') + 1, data.new.length);

                    if (jstreeDiv.jstree(true).is_open(newParent)) {
                        if (jstreeDiv.jstree(true).is_open(oldParent)) {
                            jstreeDiv.unbind('move_node.jstree');
                            jstreeDiv.jstree(true).move_node(data.path, newParent);
                            jstreeDiv.bind('move_node.jstree', moveNode);
                        }
                        else
                            jstreeDiv.jstree(true).create_node(newParent, {
                                text: newName, id: data.path, icon: data.isDir ? 'jstree-folder' : 'jstree-file'
                            });
                    }
                    else
                        jstreeDiv.jstree(true).delete_node(data.path);

                    jstreeDiv.unbind('rename_node.jstree');
                    jstreeDiv.jstree(true).rename_node(data.path, newName);
                    jstreeDiv.bind('rename_node.jstree', renameNode);

                    jstreeDiv.jstree(true).set_id(data.path, data.new);
                    break;

                case 'DELETE':
                    if (jstreeDiv.jstree(true).get_node(data.path))
                        jstreeDiv.jstree(true).delete_node(data.path);
                    break;

                default:
                    break;
            }
        });

        // Double click on node
        function doubleClick(event) {
            let node = $(event.target).closest('li')[0];
            let nodeName = jstreeDiv.jstree(true).get_text(node.id);

            $.get('/api/assets', { path: node.id }, (data) => {
                if (typeof data !== 'object') {
                    if (nodeName.substr(nodeName.lastIndexOf('.') + 1, nodeName.length) === 'json')
                        data = JSON.parse(data);
                    else
                        data = new File([ data ], nodeName);
                }

                if (data.metadata && data.metadata.type === 'Scene') {
                    editor.clear();
                    editor.fromJSON(data);
                    editor.scene.name = nodeName.substr(0, nodeName.indexOf('.'));
                }
                else if (!Array.isArray(data))
                    editor.loader.loadFile(data);
            });
        }
        jstreeDiv.bind('dblclick.jstree', doubleClick);

        // Rename node
        function renameNode(e, data) {
            let notif = new console.notification();
            let oldPath = data.node.id;
            let newPath = data.node.parent + '/' + data.text;
            let nodeType = jstreeDiv.jstree(true).get_icon(data.node) === 'jstree-file' ? 'file' : 'folder';

            // If it's a new node
            if (oldPath.substr(oldPath.lastIndexOf('/') + 1, oldPath.length) === 'New node' ||
                oldPath !== data.node.parent + '/' + data.old) {
                if (nodeType === 'folder')
                    $.post('/api/assets/dir', { path: newPath }, () => notif.exec('Directory ' + data.text + ' created.'));
                else if (nodeType === 'file') {
                    let formData = new FormData();

                    formData.append(newPath, new File([ '.' ], data.text, { type: "text/plain", lastModified: new Date() }));
                    $.ajax({
                        url: '/api/assets', type: 'POST',
                        data: formData,
                        cache: false, contentType: false, processData: false,
                        success: function (result) { notif.exec('File ' + data.text + ' created.'); }
                    });
                }
            }
            else // Else, it's a rename
                $.ajax({
                    url: '/api/assets', type: 'PUT', data: { path: oldPath, new: newPath },
                    success: function (result) { notif.exec('File ' + data.text + ' renamed.'); }
                });
            jstreeDiv.jstree(true).set_id(data.node, newPath);
        }
        jstreeDiv.bind('rename_node.jstree', renameNode);

        // Move node
        function moveNode(e, data) {
            let notif = new console.notification('File ' + data.text + ' moved. ');
            let oldPath = data.old_parent + '/' + data.node.text;
            let newPath = data.parent + '/' + data.node.text;

            $.ajax({
                url: '/api/assets', type: 'PUT', data: { path: oldPath, new: newPath },
                success: function (res) { notif.exec(); }
            });
            jstreeDiv.jstree(true).set_id(data.node, newPath);
        }
        jstreeDiv.bind('move_node.jstree', moveNode);
    });

    return (container);
};