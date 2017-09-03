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
                        return ('/assets');
                    },
                    data: function (node) {
                        return ({ id: node.id });
                    }
                }
            },
            'plugins': [ 'contextmenu' ]
        });

        jstreeDiv.bind('dblclick.jstree', function (event) {
            let node = $(event.target).closest('li')[0];
            //let data = node.data('jstree');

            //console.log(node.id);
        });
    });

    return (container);
};