/**
 * @author mrdoob / http://mrdoob.com/
 */

let Sidebar = function (editor, container) {
	let eventHub = container.layoutManager.eventHub;

    container.dom = container.getElement()[0];
	container.dom.className = 'Panel';
	container.dom.id = 'sidebar';

	//

	let sceneTab = new UI.Text('SCENE').onClick(onClick);
	let projectTab = new UI.Text('PROJECT').onClick(onClick);
	let settingsTab = new UI.Text('SETTINGS').onClick(onClick);

	let tabs = new UI.Div();
	tabs.setId('tabs');
	tabs.add(sceneTab, projectTab, settingsTab);
	container.dom.append(tabs.dom);

	function onClick(event) { select(event.target.textContent); }

	//

	let scene = new UI.Span().add(
		new Sidebar.Scene(editor),
		new Sidebar.Properties(editor, eventHub),
		new Sidebar.Animation(editor),
		new Sidebar.Script(editor, eventHub)
	);
	//container.add(scene);
	container.dom.append(scene.dom);

	let project = new UI.Span().add(new Sidebar.Project(editor, eventHub));
	//container.add(project);
	container.dom.append(project.dom);

	let settings = new UI.Span().add(
		new Sidebar.Settings(editor),
		new Sidebar.History(editor)
	);
	//container.add(settings);
	container.dom.append(settings.dom);

	//

	function select(section) {
		sceneTab.setClass('');
		projectTab.setClass('');
		settingsTab.setClass('');

		scene.setDisplay('none');
		project.setDisplay('none');
		settings.setDisplay('none');

		switch (section) {
			case 'SCENE':
				sceneTab.setClass('selected');
				scene.setDisplay('');
				break;
			case 'PROJECT':
				projectTab.setClass('selected');
				project.setDisplay('');
				break;
			case 'SETTINGS':
				settingsTab.setClass('selected');
				settings.setDisplay('');
				break;
		}
	}
	select('SCENE');

	return (container);
};
