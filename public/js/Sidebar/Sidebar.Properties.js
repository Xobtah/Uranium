/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Properties = function (editor, eventHub) {
	let signals = editor.signals;

	let container = new UI.Span();

	let objectTab = new UI.Text('OBJECT').onClick(onClick);
	let geometryTab = new UI.Text('GEOMETRY').onClick(onClick);
	let materialTab = new UI.Text('MATERIAL').onClick(onClick);
	let physicsTab = new UI.Text('PHYSICS').onClick(onClick);

	let tabs = new UI.Div();
	tabs.setId('tabs');
	tabs.add(objectTab, geometryTab, materialTab, physicsTab);
	container.add(tabs);

	function onClick(event) {
		select(event.target.textContent);
	}

	//

	let object = new UI.Span().add(new Sidebar.Object(editor));
	container.add(object);

	let geometry = new UI.Span().add(new Sidebar.Geometry(editor));
	container.add(geometry);

	let material = new UI.Span().add(new Sidebar.Material(editor, eventHub));
	container.add(material);

    let physics = new UI.Span().add(new Sidebar.Physics(editor, eventHub));
    container.add(physics);

	//

	function select(section) {
		objectTab.setClass('');
		geometryTab.setClass('');
		materialTab.setClass('');
		physicsTab.setClass('');

		object.setDisplay('none');
		geometry.setDisplay('none');
		material.setDisplay('none');
		physics.setDisplay('none');

		switch (section) {
			case 'OBJECT':
				objectTab.setClass('selected');
				object.setDisplay('');
				break;
			case 'GEOMETRY':
				geometryTab.setClass('selected');
				geometry.setDisplay('');
				break;
			case 'MATERIAL':
				materialTab.setClass('selected');
				material.setDisplay('');
				break;
            case 'PHYSICS':
                physicsTab.setClass('selected');
                physics.setDisplay('');
                break;
		}
	}

	select('OBJECT');

	return (container);
};
