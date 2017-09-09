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
                        let parent = node;
                        node = tree.create_node(node);
                        tree.set_icon(node, 'jstree-file');
                        tree.edit(node);
                        tree.set_id(node, parent.id + '/' + tree.get_text(node));
                    }
                },
                folderItem: {
                    label: 'Folder',
                    icon: 'jstree-folder',
                    action: function () {
                        let parent = node;
                        node = tree.create_node(node);
                        tree.set_icon(node, 'jstree-folder');
                        tree.edit(node);
                        tree.set_id(node, parent.id + '/' + tree.get_text(node));
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
                if (node.children.length === 0 || confirm('Do you want to delete ' + node.text + '?'))
                    tree.delete_node(node);
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
                tree.refresh(node);
            }
        }

    };

    return (items);
};