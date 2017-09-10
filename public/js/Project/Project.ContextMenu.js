/**
 * Created by xobtah on 08/09/17.
 */

Project.ContextMenu = function (node) {
    let tree = $('#jstree').jstree(true);

    let items = {

        openItem: {
            label: 'Open',
            action: function () {
                if (tree.get_icon(node) === 'jstree-folder')
                    tree.open_node(node);
                else if (tree.get_icon(node) === 'jstree-file')
                    $.get('/api/assets', { path: node.id }, (data) => {
                        if (typeof data !== 'object') {
                            if (node.text.substr(node.text.lastIndexOf('.') + 1, node.text.length) === 'json')
                                data = JSON.parse(data);
                            else
                                data = new File([ data ], node.text);
                        }

                        if (data.metadata && data.metadata.type === 'Scene') {
                            editor.clear();
                            editor.fromJSON(data);
                            editor.scene.name = node.text.substr(0, node.text.indexOf('.'));
                        }
                        else if (!Array.isArray(data))
                            editor.loader.loadFile(data);
                    });
            }
        },

        createItem: {
            separator_before: false,
            separator_after: true,
            label: 'Create',
            _disabled: tree.get_icon(node) === 'jstree-file',
            submenu: {
                fileItem: {
                    label: 'File',
                    icon: 'jstree-file',
                    action: function () {
                        node = tree.create_node(node, {
                            text: 'New node',
                            id: node.id + '/New node',
                            icon: 'jstree-file'
                        });
                        tree.edit(node);
                    }
                },
                folderItem: {
                    label: 'Folder',
                    icon: 'jstree-folder',
                    action: function () {
                        node = tree.create_node(node, {
                            text: 'New node',
                            id: node.id + '/New node',
                            icon: 'jstree-folder'
                        });
                        tree.edit(node);
                    }
                }
            }
        },

        renameItem: {
            label: 'Rename',
            action: function () {
                tree.edit(node);
            }
        },

        deleteItem: {
            label: 'Delete',
            action: function () {
                let notif = new console.notification('File ' + node.text + ' deleted.');

                if (node.children.length === 0 || confirm('Do you want to delete ' + node.text + '?'))
                    $.ajax({
                        url: '/api/assets', type: 'DELETE', data: { path: node.id },
                        success: function (result) {
                            tree.delete_node(node);
                            notif.exec();
                        }
                    });
            }
        },

        editItem: {
            separator_before: true,
            label: 'Edit',
            submenu: {
                cutItem: {
                    label: 'Cut',
                    action: function () {
                        tree.cut(node);
                    }
                },
                copyItem: {
                    label: 'Copy',
                    action: function () {
                        tree.copy(node);
                    }
                },
                pasteItem: {
                    label: 'Paste',
                    _disabled: !tree.can_paste(),
                    action: function () {
                        tree.paste(node);
                    }
                },
            }
        },

        refreshItem: {
            separator_before: true,
            label: 'Refresh',
            action: function () {
                let notif = new console.notification('Tree refreshed.');

                tree.refresh(node);
                notif.exec();
            }
        }

    };

    return (items);
};