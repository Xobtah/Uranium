/**
 * @author mrdoob / http://mrdoob.com/
 */

let Player = function (editor, container) {
    let ipcRenderer = require('electron').ipcRenderer;
    let eventHub = container.layoutManager.eventHub;

    container.dom = container.getElement()[0];
    container.dom.className = 'Panel';
    container.dom.id = 'player';
	container.dom.style.display = 'none';

	//

	let player = new APP.Player();
	container.dom.appendChild(player.dom);

	//

    ipcRenderer.on('playStop', (event, arg) => arg ? eventHub.emit('startPlayer') : eventHub.emit('stopPlayer'));

	container.on('resize', () => {
        player.setSize(container.dom.clientWidth, container.dom.clientHeight);
	});

	eventHub.on('startPlayer', () => {
        container.dom.style.display = '';

        player.load(editor.toJSON());
        player.setSize(container.dom.clientWidth, container.dom.clientHeight);
        player.play();
	});

    eventHub.on('stopPlayer', () => {
		container.dom.style.display = 'none';

		player.stop();
		player.dispose();
	});

	return (container);
};
