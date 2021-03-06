/**
 * @author mrdoob / http://mrdoob.com/
 */

let Player = function (editor, container) {
    let eventHub = container.layoutManager.eventHub;
    let signals = editor.signals;

    container.dom = container.getElement()[0];
    container.dom.className = 'Panel';
    container.dom.id = 'player';

    //

    let player = new APP.Player(editor, container);
    container.dom.appendChild(player.dom);

    //

    signals.startPlayer.add(() => eventHub.emit('startPlayer'));
    signals.stopPlayer.add(() => eventHub.emit('stopPlayer'));

    container.on('resize', () => {
        player.setSize(container.dom.clientWidth, container.dom.clientHeight);
    });

    eventHub.on('startPlayer', () => {
        player.load(editor.toJSON());
        player.setSize(container.dom.clientWidth, container.dom.clientHeight);
        player.play();
    });

    eventHub.on('stopPlayer', () => {
        player.stop();
        player.dispose();
    });

    return (container);
};
