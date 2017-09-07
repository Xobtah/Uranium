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

    $(document).ready(() => {
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
                check_callback: true // For Create from contextmenu to work
            },
            plugins: [ 'contextmenu', 'dnd' ]
        });

        // FileSystemChanged signal
        editor.signals.fileSystemChanged.add(() => jstreeDiv.jstree(true).refresh());

        // Double click on node
        jstreeDiv.bind('dblclick.jstree', function (event) {
            let node = $(event.target).closest('li');

            $.get('/api/assets', { path: node[0].id }, (data, err) => {
                if (data.metadata && data.metadata.type === 'Scene') {
                    editor.clear();
                    editor.fromJSON(data);
                }
            });
        });

        // Rename node
        jstreeDiv.bind('rename_node.jstree', (e, data) => {
            let start = performance.now();
            let oldPath = data.node.id;
            let newPath = data.node.parent + '/' + data.text;

            if (oldPath === data.node.parent + '/' + data.old)
                $.ajax({
                    url: '/api/assets', type: 'PUT',
                    data: { path: oldPath, new: newPath },
                    success: function (result) {
                        console.log('[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']', 'File ' + data.text + ' renamed. ' + (performance.now() - start).toFixed(2) + 'ms');
                    }
                });
            else
                $.post('/api/assets', { path: newPath }, () =>
                    console.log('[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']', 'File ' + data.text + ' created. ' + (performance.now() - start).toFixed(2) + 'ms'));
            jstreeDiv.jstree(true).set_id(data.node, newPath);
            socket.emit('fileSystemChanged');
        });

        // Delete node
        jstreeDiv.bind('delete_node.jstree', (e, data) => {
            let start = performance.now();

            $.ajax({
                url: '/api/assets', type: 'DELETE',
                data: { path: data.node.id },
                success: function (result) {
                    console.log('[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']', 'File ' + data.text + ' deleted. ' + (performance.now() - start).toFixed(2) + 'ms');
                }
            });
            socket.emit('fileSystemChanged');
        });

        // Move node
        jstreeDiv.bind('move_node.jstree', (e, data) => {
            let start = performance.now();
            let oldPath = data.node.id;
            let newPath = data.parent + '/' + data.node.text;

            $.ajax({
                url: '/api/assets', type: 'PUT',
                data: { path: oldPath, new: newPath },
                success: function (result) {
                    console.log('[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']', 'File ' + data.text + ' moved. ' + (performance.now() - start).toFixed(2) + 'ms');
                }
            });
            jstreeDiv.jstree(true).set_id(data.node, newPath);
            socket.emit('fileSystemChanged');
        });
    });

    return (container);
};