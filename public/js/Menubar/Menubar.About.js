/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.About = function (editor) {
	var container = new UI.Panel();
	container.setClass('menu');

	var title = new UI.Panel();
	title.setClass('title');
	title.setTextContent('About');
	container.add(title);

	var options = new UI.Panel();
	options.setClass('options');
	container.add(options);

	// Source code

	var option = new UI.Row();
	option.setClass('option');
	option.setTextContent('Source code');
	option.onClick(function () {
		window.open('https://github.com/Xobtah/Uranium-235.git', '_blank');
	});
	options.add(option);

	return (container);
};
