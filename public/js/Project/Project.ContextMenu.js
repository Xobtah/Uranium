/**
 * Created by xobtah on 08/09/17.
 */

Project.ContextMenu = function (node) {
    let tree = $('#jstree').jstree(true);

    let items = {

        openItem: {
            label: 'Open',
            action: function (node) {
                if (tree.get_icon(node) === 'jstree-folder')
                    tree.open_node(node);
                else if (tree.get_icon(node) === 'jstree-file')
                    editor.execute(new AddObjectCommand(object));
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
                        /*let parent = node;
                        let notif = new console.notification();
                        let formData = new FormData();*/

                        node = tree.create_node(node, {
                            text: 'New node',
                            id: node.id + '/New node',
                            icon: 'jstree-file'
                        });
                        tree.edit(node);
                        /*formData.append(parent.id + '/' + tree.get_text(node), new File([ '.' ], tree.get_text(node)));
                        $.ajax({
                            url: '/api/assets', type: 'POST',
                            data: formData,
                            cache: false, contentType: false, processData: false,
                            success: function (result) {
                                notif.exec('File ' + tree.get_text(node) + ' created.');
                            }
                        });*/
                    }
                },
                folderItem: {
                    label: 'Folder',
                    icon: 'jstree-folder',
                    action: function () {
                        /*let notif = new console.notification();
                        let parent = node;*/

                        node = tree.create_node(node, {
                            text: 'New node',
                            id: node.id + '/New node',
                            icon: 'jstree-folder'
                        });
                        tree.edit(node);
                        /*$.post('/api/assets/dir', { path: parent.id + '/' + tree.get_text(node) }, () => {
                            notif.exec('Directory ' + tree.get_text(node) + ' created.');
                        });*/
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