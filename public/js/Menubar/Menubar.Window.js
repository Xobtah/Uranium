/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.Window = function (editor) {
	let componentList = [ 'Scene', 'Game', 'Sidebar', 'Script' ];

	let container = new UI.Panel();
	container.setClass('menu');

	let title = new UI.Panel();
	title.setClass('title');
	title.setTextContent('Window');
	container.add(title);

	let options = new UI.Panel();
	options.setClass('options');
	container.add(options);

	function addComponent(component) {
        if (componentList.indexOf(component) < 0)
        	return ;
		layout.root.contentItems[0].addChild({ type: 'component', componentName: component, componentState: {  } }, 0);
	}

	// Components

	componentList.forEach((component) => {
        let option = new UI.Row();
        option.setClass('option');
        option.setTextContent(component);
        option.onClick(function () { addComponent(component); });
        options.add(option);
	});

	return (container);
};
