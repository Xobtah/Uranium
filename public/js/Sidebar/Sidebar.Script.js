/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Script = function (editor, eventHub) {
	let signals = editor.signals;

	let container = new UI.Panel();
	container.setDisplay('none');

	container.add(new UI.Text('Script').setTextTransform('uppercase'));
	container.add(new UI.Break());
	container.add(new UI.Break());

	//

	let scriptsContainer = new UI.Row();
	container.add(scriptsContainer);

	let newScript = new UI.Button('New');
	newScript.onClick(function () {
		let script = { name: '', source: 'function update(event) {}' };
		editor.execute(new AddScriptCommand(editor.selected, script));
	});
	container.add(newScript);

	/*
	let loadScript = new UI.Button('Load');
	loadScript.setMarginLeft('4px');
	container.add(loadScript);
	*/

	//

	function update() {
		scriptsContainer.clear();
		scriptsContainer.setDisplay('none');

		let object = editor.selected;

		if (object === null)
			return ;

		let scripts = editor.scripts[object.uuid];

		if (scripts !== undefined) {
			scriptsContainer.setDisplay('block');

			for (let i = 0; i < scripts.length; i++) {
				(function (object, script) {
					let name = new UI.Input(script.name).setWidth('130px').setFontSize('12px');
					name.onChange(function () {
						editor.execute(new SetScriptValueCommand(editor.selected, script, 'name', this.getValue()));
					});
					scriptsContainer.add(name);

					let edit = new UI.Button('Edit');
					edit.setMarginLeft('4px');
					edit.onClick(function () {
						eventHub.emit('editScript', object, script);
					});
					scriptsContainer.add(edit);

					let remove = new UI.Button('Remove');
					remove.setMarginLeft('4px');
					remove.onClick(function () {
						if (confirm('Are you sure?'))
							editor.execute(new RemoveScriptCommand(editor.selected, script));
					});
					scriptsContainer.add(remove);

					scriptsContainer.add(new UI.Break());
				})(object, scripts[i])
			}
		}
	}

	// signals

	signals.objectSelected.add(function (object) {
		if (object !== null && editor.camera !== object) {
			container.setDisplay('block');
			update();
		}
		else
			container.setDisplay('none');
	});

	signals.scriptAdded.add(update);
	signals.scriptRemoved.add(update);
	signals.scriptChanged.add(update);

	return (container);
};
