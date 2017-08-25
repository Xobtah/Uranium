/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Scene = function (editor) {
	let signals = editor.signals;

	let container = new UI.Panel();
	container.setBorderTop('0');
	container.setPaddingTop('20px');

	// outliner

	function buildOption(object, draggable) {
		let option = document.createElement('div');
		option.draggable = draggable;
		option.innerHTML = buildHTML(object);
		option.value = object.id;

		return (option);
	}

	function getMaterialName(material) {
		if (Array.isArray(material)) {
			let array = [];

			for (let i = 0; i < material.length; i++)
				array.push( material[ i ].name );

			return (array.join(','));
		}

		return (material.name);
	}

	function buildHTML(object) {
		let html = '<span class="type ' + object.type + '"></span> ' + object.name;

		if (object instanceof THREE.Mesh) {
			let geometry = object.geometry;
			let material = object.material;

			html += ' <span class="type ' + geometry.type + '"></span> ' + geometry.name;
			html += ' <span class="type ' + material.type + '"></span> ' + getMaterialName(material);
		}

		html += getScript(object.uuid);

		return (html);
	}

	function getScript(uuid) {
		if (editor.scripts[ uuid ] !== undefined)
			return (' <span class="type Script"></span>');

		return ('');
	}

	let ignoreObjectSelectedSignal = false;

	let outliner = new UI.Outliner(editor);
	outliner.setId('outliner');
	outliner.onChange(function () {
		ignoreObjectSelectedSignal = true;

		editor.selectById(parseInt(outliner.getValue()));

		ignoreObjectSelectedSignal = false;
	});
	outliner.onDblClick(function () {
		editor.focusById(parseInt(outliner.getValue()));
	});
	container.add(outliner);
	container.add(new UI.Break());

	// background

	function onBackgroundChanged() {
		signals.sceneBackgroundChanged.dispatch(backgroundColor.getHexValue());
	}

	let backgroundRow = new UI.Row();

	let backgroundColor = new UI.Color().setValue('#aaaaaa').onChange(onBackgroundChanged);

	backgroundRow.add(new UI.Text('Background').setWidth('90px'));
	backgroundRow.add(backgroundColor);

	container.add(backgroundRow);

	// fog

	function onFogChanged() {
		signals.sceneFogChanged.dispatch(
			fogType.getValue(),
			fogColor.getHexValue(),
			fogNear.getValue(),
			fogFar.getValue(),
			fogDensity.getValue()
		);
	}

	let fogTypeRow = new UI.Row();
	let fogType = new UI.Select().setOptions({
		'None': 'None',
		'Fog': 'Linear',
		'FogExp2': 'Exponential'
	}).setWidth('150px');
	fogType.onChange(function () {
		onFogChanged();
		refreshFogUI();
	});

	fogTypeRow.add(new UI.Text('Fog').setWidth('90px'));
	fogTypeRow.add(fogType);

	container.add(fogTypeRow);

	// fog color

	let fogPropertiesRow = new UI.Row();
	fogPropertiesRow.setDisplay('none');
	fogPropertiesRow.setMarginLeft('90px');
	container.add(fogPropertiesRow);

	let fogColor = new UI.Color().setValue('#aaaaaa');
	fogColor.onChange(onFogChanged);
	fogPropertiesRow.add(fogColor);

	// fog near

	let fogNear = new UI.Number(0.1).setWidth('40px').setRange(0, Infinity).onChange(onFogChanged);
	fogPropertiesRow.add(fogNear);

	// fog far

	let fogFar = new UI.Number(50).setWidth('40px').setRange(0, Infinity).onChange(onFogChanged);
	fogPropertiesRow.add(fogFar);

	// fog density

	let fogDensity = new UI.Number(0.05).setWidth('40px').setRange(0, 0.1).setPrecision(3).onChange(onFogChanged);
	fogPropertiesRow.add(fogDensity);

	//

	function refreshUI() {
		let camera = editor.camera;
		let scene = editor.scene;

		let options = [];

		options.push(buildOption(camera, false));
		options.push(buildOption(scene, false));

		(function addObjects(objects, pad) {
			for (let i = 0, l = objects.length; i < l; i++) {
				let object = objects[i];

				let option = buildOption(object, true);
				option.style.paddingLeft = (pad * 10) + 'px';
				options.push(option);

				addObjects(object.children, pad + 1);
			}
		})(scene.children, 1);

		outliner.setOptions(options);

		if (editor.selected !== null)
			outliner.setValue(editor.selected.id);

		if (scene.background)
			backgroundColor.setHexValue(scene.background.getHex());

		if (scene.fog) {
			fogColor.setHexValue(scene.fog.color.getHex());

			if (scene.fog instanceof THREE.Fog) {
				fogType.setValue('Fog');
				fogNear.setValue(scene.fog.near);
				fogFar.setValue(scene.fog.far);
			}
			else if (scene.fog instanceof THREE.FogExp2) {
				fogType.setValue('FogExp2');
				fogDensity.setValue(scene.fog.density);
			}
		}
		else
			fogType.setValue('None');

		refreshFogUI();
	}

	function refreshFogUI() {
		let type = fogType.getValue();

		fogPropertiesRow.setDisplay(type === 'None' ? 'none' : '');
		fogNear.setDisplay(type === 'Fog' ? '' : 'none');
		fogFar.setDisplay(type === 'Fog' ? '' : 'none');
		fogDensity.setDisplay(type === 'FogExp2' ? '' : 'none');
	}

	refreshUI();

	// events

	signals.editorCleared.add(refreshUI);

	signals.sceneGraphChanged.add(refreshUI);

	signals.objectChanged.add(function (object) {
		let options = outliner.options;

		for (let i = 0; i < options.length; i++) {
			let option = options[i];

			if (option.value === object.id) {
				option.innerHTML = buildHTML(object);
				return ;
			}
		}
	});

	signals.objectSelected.add(function (object) {
		if (ignoreObjectSelectedSignal === true)
			return ;

		outliner.setValue(object !== null ? object.id : null);
	});

	return (container);
};
