/**
 * @author mrdoob / http://mrdoob.com/
 */

let Player = function (editor, dom) {
    //let ipcRenderer = require('electron').ipcRenderer;
	let signals = editor.signals;

	//let container = new UI.Panel();
	let container = { dom: dom };
    container.dom.className = 'Panel';
	//container.setId('player');
    container.dom.id = 'player';
	//container.setPosition('absolute');
	//container.setDisplay('none');
	container.dom.style.display = 'none';

	//

	let player = new APP.Player();
	container.dom.appendChild(player.dom);

	window.addEventListener('resize', function () {
		player.setSize(container.dom.clientWidth, container.dom.clientHeight);
	});

    //ipcRenderer.on('playStop', (event, arg) => arg ? signals.startPlayer.dispatch() : signals.stopPlayer.dispatch());

	signals.startPlayer.add(function () {
		//container.setDisplay('');
		container.dom.style.display = '';

		player.load(editor.toJSON());
		player.setSize(container.dom.clientWidth, container.dom.clientHeight);
		player.play();
	});

	signals.stopPlayer.add(function () {
		//container.setDisplay('none');
		container.dom.style.display = 'none';

		player.stop();
		player.dispose();
	});

	return (container);
};
