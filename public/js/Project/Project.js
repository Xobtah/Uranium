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

        // FileSystemChanged signal
        editor.signals.fileSystemChanged.add(() => jstreeDiv.jstree(true).refresh());

        // Double click on node
        jstreeDiv.bind('dblclick.jstree', function (event) {
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
                }
                else if (!Array.isArray(data))
                    editor.loader.loadFile(data);
                    /*switch (nodeName.substr(nodeName.lastIndexOf('.') + 1, nodeName.length)) {
                        case 'obj':
                            editor.loader.loadFile(file);
                            break;
                        default:
                            break;
                    }*/
            });
        });

        // Rename node
        jstreeDiv.bind('rename_node.jstree', (e, data) => {
            let start = performance.now();
            let oldPath = data.node.id;
            let newPath = data.node.parent + '/' + data.text;
            let nodeType = jstreeDiv.jstree(true).get_icon(data.node) === 'jstree-file' ? 'file' : 'folder';

            if (oldPath.substr(oldPath.lastIndexOf('/') + 1, oldPath.length) === 'New node' ||
                oldPath !== data.node.parent + '/' + data.old)
                $.post('/api/assets', { path: newPath, type: nodeType }, () =>
                    console.log('[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']', 'File ' + data.text + ' created. ' + (performance.now() - start).toFixed(2) + 'ms'));
            else
                $.ajax({
                    url: '/api/assets', type: 'PUT',
                    data: { path: oldPath, new: newPath },
                    success: function (result) {
                        console.log('[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']', 'File ' + data.text + ' renamed. ' + (performance.now() - start).toFixed(2) + 'ms');
                    }
                });
            jstreeDiv.jstree(true).set_id(data.node, newPath);
        });

        // Delete node
        jstreeDiv.bind('delete_node.jstree', (e, data) => {
            let start = performance.now();

            $.ajax({
                url: '/api/assets', type: 'DELETE',
                data: { path: data.node.id },
                success: function (result) {
                    console.log('[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']', 'File ' + data.node.text + ' deleted. ' + (performance.now() - start).toFixed(2) + 'ms');
                }
            });
        });

        // Move node
        jstreeDiv.bind('move_node.jstree', (e, data) => {
            let start = performance.now();
            let oldPath = data.old_parent + '/' + data.node.text;
            let newPath = data.parent + '/' + data.node.text;

            $.ajax({
                url: '/api/assets', type: 'PUT',
                data: { path: oldPath, new: newPath },
                success: function (result) {
                    console.log('[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']', 'File ' + data.text + ' moved. ' + (performance.now() - start).toFixed(2) + 'ms');
                }
            });
            jstreeDiv.jstree(true).set_id(data.node, newPath);
        });
    });

    return (container);
};