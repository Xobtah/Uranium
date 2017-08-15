/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Settings = function (editor) {
	let config = editor.config;
	let signals = editor.signals;

	let container = new UI.Panel();
	container.setBorderTop('0');
	container.setPaddingTop('20px');

	// class

	let options = {
		'css/light.css': 'light',
		'css/dark.css': 'dark'
	};

	let themeRow = new UI.Row();
	let theme = new UI.Select().setWidth('150px');
	theme.setOptions(options);

	if (config.getKey('theme') !== undefined)
		theme.setValue(config.getKey('theme'));

	theme.onChange(function () {
		let value = this.getValue();

		editor.setTheme(value);
		editor.config.setKey('theme', value);
	});

	themeRow.add(new UI.Text('Theme').setWidth('90px'));
	themeRow.add(theme);

	container.add(themeRow);

	return (container);
};
