/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Project = function (editor) {
	let config = editor.config;
	let signals = editor.signals;

	let rendererTypes = {
		'WebGLRenderer': THREE.WebGLRenderer,
		'CanvasRenderer': THREE.CanvasRenderer,
		'SVGRenderer': THREE.SVGRenderer,
		'SoftwareRenderer': THREE.SoftwareRenderer,
		'RaytracingRenderer': THREE.RaytracingRenderer
	};

	let container = new UI.Panel();
	container.setBorderTop('0');
	container.setPaddingTop('20px');

	// class

	let options = {};

	for (let key in rendererTypes) {
		if (key.indexOf('WebGL') >= 0 && System.support.webgl === false)
			continue;
		options[key] = key;
	}

	let rendererTypeRow = new UI.Row();
	let rendererType = new UI.Select().setOptions(options).setWidth('150px').onChange(function () {
		let value = this.getValue();
		config.setKey('project/renderer', value);
		updateRenderer();
	});

	rendererTypeRow.add(new UI.Text('Renderer').setWidth('90px'));
	rendererTypeRow.add(rendererType);

	container.add(rendererTypeRow);

	if (config.getKey('project/renderer') !== undefined) {
		rendererType.setValue(config.getKey('project/renderer'));
	}

	// antialiasing

	let rendererPropertiesRow = new UI.Row().setMarginLeft('90px');

	let rendererAntialias = new UI.THREE.Boolean(config.getKey('project/renderer/antialias'), 'antialias').onChange(function () {
		config.setKey('project/renderer/antialias', this.getValue());
		updateRenderer();
	});
	rendererPropertiesRow.add(rendererAntialias);

	// shadow

	let rendererShadows = new UI.THREE.Boolean(config.getKey('project/renderer/shadows'), 'shadows').onChange(function () {
		config.setKey('project/renderer/shadows', this.getValue());
		updateRenderer();
	});
	rendererPropertiesRow.add(rendererShadows);

	rendererPropertiesRow.add(new UI.Break());

	// gamma input

	let rendererGammaInput = new UI.THREE.Boolean(config.getKey('project/renderer/gammaInput'), 'γ input').onChange(function () {
		config.setKey('project/renderer/gammaInput', this.getValue());
		updateRenderer();
	});
	rendererPropertiesRow.add(rendererGammaInput);

	// gamma output

	let rendererGammaOutput = new UI.THREE.Boolean(config.getKey('project/renderer/gammaOutput'), 'γ output').onChange(function () {
		config.setKey('project/renderer/gammaOutput', this.getValue());
		updateRenderer();
	});
	rendererPropertiesRow.add(rendererGammaOutput);

	container.add(rendererPropertiesRow);

	// VR

	let vrRow = new UI.Row();
	let vr = new UI.Checkbox(config.getKey('project/vr')).setLeft('100px').onChange(function () {
		config.setKey('project/vr', this.getValue());
		// updateRenderer();
	});

	vrRow.add(new UI.Text('VR').setWidth('90px'));
	vrRow.add(vr);

	container.add(vrRow);

	//

	function updateRenderer() {
		createRenderer(rendererType.getValue(), rendererAntialias.getValue(), rendererShadows.getValue(), rendererGammaInput.getValue(), rendererGammaOutput.getValue());
	}

	function createRenderer(type, antialias, shadows, gammaIn, gammaOut) {
		if (type === 'WebGLRenderer' && System.support.webgl === false)
			type = 'CanvasRenderer';

		rendererPropertiesRow.setDisplay(type === 'WebGLRenderer' ? '' : 'none');

		let renderer = new rendererTypes[type]({ antialias: antialias });
		renderer.gammaInput = gammaIn;
		renderer.gammaOutput = gammaOut;
		if (shadows && renderer.shadowMap) {
			renderer.shadowMap.enabled = true;
			// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		}

		signals.rendererChanged.dispatch(renderer);
	}

	createRenderer(config.getKey('project/renderer'), config.getKey('project/renderer/antialias'), config.getKey('project/renderer/shadows'), config.getKey('project/renderer/gammaInput'), config.getKey('project/renderer/gammaOutput'));

	return (container);
};
