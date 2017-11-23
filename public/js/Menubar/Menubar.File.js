/**
 * @author mrdoob / http://mrdoob.com/
 */

Menubar.File = function (editor) {
	let NUMBER_PRECISION = 6;

	function parseNumber(key, value) {
		return (typeof value === 'number' ? parseFloat(value.toFixed(NUMBER_PRECISION)) : value);
	}

	//

	var container = new UI.Panel();
	container.setClass('menu');

	var title = new UI.Panel();
	title.setClass('title');
	title.setTextContent('File');
	container.add(title);

	var options = new UI.Panel();
	options.setClass('options');
	container.add(options);

	// New Scene

	var option = new UI.Row();
	option.setClass('option');
	option.setTextContent('New Scene');
	option.onClick(() => {
        let sceneName = null;

		if (confirm('Any unsaved data will be lost. Are you sure?')) {
			sceneName = prompt('Name your new scene:');
            if (sceneName.length) {
                editor.clear();
                editor.scene.name = sceneName;
            }
		}
	});
	options.add(option);

    // Save Scene

    var option = new UI.Row();
    option.setClass('option');
    option.setTextContent('Save Scene');
    option.onClick(() => {
        let formData = new FormData();
        let notif = new console.notification('Scene ' + editor.scene.name + ' saved.');

        formData.append('Test/Assets/' + editor.scene.name + '.json', new File([ JSON.stringify(editor.toJSON()) ], editor.scene.name + '.json'));
        $.ajax({
            url: '/api/assets', type: 'POST',
            data: formData,
            cache: false, contentType: false, processData: false,
            success: function (res) { notif.exec(); }
        });
    });
    options.add(option);

	//

	options.add(new UI.HorizontalRule());

	// Import

	let fileInput = document.createElement('input');
	fileInput.type = 'file';
	fileInput.addEventListener('change', (event) => {
        let notif = new console.notification('File ' + fileInput.files[0].name + ' uploaded.');
        let formData = new FormData();

        formData.append('Test/Assets/' + fileInput.files[0].name, fileInput.files[0]);
        $.ajax({
            url: '/api/assets',
            type: 'POST',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            success: function (res) {
                notif.exec();
                editor.loader.loadFile(fileInput.files[0]);
            }
        });
	});

	var option = new UI.Row();
	option.setClass('option');
	option.setTextContent('Import');
	option.onClick(() => fileInput.click());
	options.add(option);

	//

	options.add(new UI.HorizontalRule());

	// Export Geometry

	var option = new UI.Row();
	option.setClass('option');
	option.setTextContent('Export Geometry');
	option.onClick(() => {
		var object = editor.selected;

		if (object === null) {
			alert('No object selected.');
			return ;
		}

		var geometry = object.geometry;

		if (geometry === undefined) {
			alert('The selected object doesn\'t have geometry.');
			return ;
		}

		var output = geometry.toJSON();

		try {
			output = JSON.stringify(output, parseNumber, '\t');
			output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');
		} catch (e) {
			output = JSON.stringify(output);
		}

		saveString(output, 'geometry.json');

	} );
	options.add(option);

	// Export Object

	var option = new UI.Row();
	option.setClass('option');
	option.setTextContent('Export Object');
	option.onClick(() => {
		var object = editor.selected;

		if (object === null) {
			alert('No object selected');
			return ;
		}

		var output = object.toJSON();

		try {
			output = JSON.stringify(output, parseNumber, '\t');
			output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');
		} catch (e) {
			output = JSON.stringify(output);
		}

		saveString(output, 'model.json');
	});
	options.add(option);

	// Export Scene

	var option = new UI.Row();
	option.setClass('option');
	option.setTextContent('Export Scene');
	option.onClick(() => {
		var output = editor.scene.toJSON();

		try {
			output = JSON.stringify(output, parseNumber, '\t');
			output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');
		} catch (e) {
			output = JSON.stringify(output);
		}

		saveString(output, 'scene.json');
	});
	options.add(option);

	// Export OBJ

	var option = new UI.Row();
	option.setClass('option');
	option.setTextContent('Export OBJ');
	option.onClick(() => {
		var object = editor.selected;

		if (object === null) {
			alert('No object selected.');
			return ;
		}

		var exporter = new THREE.OBJExporter();

		saveString(exporter.parse(object), 'model.obj');
	});
	options.add(option);

	// Export STL

	var option = new UI.Row();
	option.setClass('option');
	option.setTextContent('Export STL');
	option.onClick(() => {
		var exporter = new THREE.STLExporter();

		saveString(exporter.parse(editor.scene), 'model.stl');
	});
	options.add(option);

	//

	options.add(new UI.HorizontalRule());

	// Publish

	var option = new UI.Row();
	option.setClass('option');
	option.setTextContent('Publish');
	option.onClick(() => {
		var zip = new JSZip();

		//

		var output = editor.toJSON();
		output.metadata.type = 'App';
		delete output.history;

		var vr = output.project.vr;

		output = JSON.stringify(output, parseNumber, '\t');
		output = output.replace(/[\n\t]+([\d\.e\-\[\]]+)/g, '$1');

		zip.file('app.json', output);

		//

		var manager = new THREE.LoadingManager(() => save(zip.generate({ type: 'blob' }), 'download.zip'));

		var loader = new THREE.FileLoader(manager);

		// index.html
		loader.load('js/libs/app/index.html', (content) => {
			var includes = [];

			if (vr) {
				includes.push('<script src="js/VRControls.js"></script>');
				includes.push('<script src="js/VREffect.js"></script>');
				includes.push('<script src="js/WebVR.js"></script>');
			}

			content = content.replace('<!-- includes -->', includes.join('\n\t\t'));

			zip.file('index.html', content);
		});

		// Application
		loader.load('js/libs/app/app.js', (content) => zip.file(editor.scene.name + '.js', content));

		// package.json
		loader.load('js/libs/app/package.json', (content) => {
			content = JSON.parse(content);
			content.name = editor.scene.name;
			zip.file('package.json', JSON.stringify(content));
		});

		// Electron main.js
		loader.load('js/libs/app/electron/main.js', (content) => { zip.file('electron/main.js', content); });

		// APP.Player
		loader.load('js/libs/app.js', (content) => { zip.file('js/app.js', content); });

		// Three
		loader.load('node_modules/three/build/three.min.js', (content) => zip.file('js/three.min.js', content));

		let libz = [
			// Four.js
			'js/libs/Four.js/Object3D.js',
			'js/libs/Four.js/ObjectLoader.js',
			'js/libs/Four.js/Rigidbody.js',
			// Physijs
			'js/libs/Physijs/physi.js',
			'js/libs/Physijs/physijs_worker.js',
			'js/libs/Physijs/examples/js/ammo.js'
		];
		libz.forEach((e) => loader.load(e, (content) => zip.file(e, content)));

		// Install
		//loader.load('js/libs/app/Install', (content) => zip.file('Install', content, { binary: true }));

		if (vr) {
			loader.load('../examples/js/controls/VRControls.js', (content) => zip.file('js/VRControls.js', content));
			loader.load('../examples/js/effects/VREffect.js', (content) => zip.file('js/VREffect.js', content));
			loader.load('../examples/js/WebVR.js', (content) => zip.file('js/WebVR.js', content));
		}
	});
	options.add(option);

	/*
	// Publish (Dropbox)

	var option = new UI.Row();
	option.setClass( 'option' );
	option.setTextContent( 'Publish (Dropbox)' );
	option.onClick( function () {

		var parameters = {
			files: [
				{ 'url': 'data:text/plain;base64,' + window.btoa( "Hello, World" ), 'filename': 'app/test.txt' }
			]
		};

		Dropbox.save( parameters );

	} );
	options.add( option );
	*/


	//

	var link = document.createElement('a');
	link.style.display = 'none';
	document.body.appendChild(link); // Firefox workaround, see #6594

	function save(blob, filename) {
		link.href = URL.createObjectURL(blob);
		link.download = filename || 'data.json';
		link.click();

		// URL.revokeObjectURL( url ); breaks Firefox...
	}

	function saveString(text, filename) {
		save(new Blob([ text ], { type: 'text/plain' }), filename);
	}

	return (container);
};
