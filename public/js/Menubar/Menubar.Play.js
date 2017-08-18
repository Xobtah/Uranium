/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Play = function (editor) {
	let signals = editor.signals;

	let container = new UI.Panel();
	container.setClass('menu');

	let isPlaying = false;

	let title = new UI.Panel();
	title.setClass('title');
	title.setTextContent('Play');
	title.onClick(function () {
		if (isPlaying === false) {
			isPlaying = true;
			title.setTextContent('Stop');
			signals.startPlayer.dispatch();
		}
		else {
			isPlaying = false;
			title.setTextContent('Play');
			signals.stopPlayer.dispatch();
		}
	} );
	container.add(title);

	return (container);
};
