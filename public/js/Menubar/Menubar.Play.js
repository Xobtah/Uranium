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
	title.setId('playStopButton');
	title.setTextContent('Play');

	signals.startPlayer.add(() => title.setTextContent('Stop'));
	signals.stopPlayer.add(() => title.setTextContent('Play'));

	title.onClick(function () {
		if (isPlaying === false) {
			isPlaying = true;
			signals.startPlayer.dispatch();
		}
		else {
			isPlaying = false;
			signals.stopPlayer.dispatch();
		}
	} );

	container.add(title);

	return (container);
};
