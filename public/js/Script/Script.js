/**
 * @author mrdoob / http://mrdoob.com/
 */

let Script = function (editor, container) {
	let eventHub = container.layoutManager.eventHub;
	let signals = editor.signals;

	container.dom = container.getElement()[0];
	container.dom.id = 'script';
    container.dom.style.backgroundColor = '#272822';
    container.dom.style.display = 'none';

	let header = new UI.Panel();
	header.setPadding('10px');
	container.dom.append(header.dom);

	let title = new UI.Text().setColor('#fff');
	header.add(title);

	let renderer;

	eventHub.on('rendererChanged', (newRenderer) => {
        renderer = newRenderer;
	});

	let delay;
	let currentMode;
	let currentScript;
	let currentObject;

	let codemirror = CodeMirror(container.dom, {
		value: '',
		lineNumbers: true,
		matchBrackets: true,
		indentWithTabs: true,
		tabSize: 4,
		indentUnit: 4,
		hintOptions: { completeSingle: false }
	});
	codemirror.setOption('theme', 'monokai');
	codemirror.on('change', function () {
		if (codemirror.state.focused === false)
			return ;

		clearTimeout(delay);
		delay = setTimeout(function () {
			let value = codemirror.getValue();

			if (!validate(value))
				return ;

			if (typeof(currentScript) === 'object') {
				if (value !== currentScript.source)
					editor.execute(new SetScriptValueCommand(currentObject, currentScript, 'source', value));
				return ;
			}

			if (currentScript !== 'programInfo')
				return ;

			let json = JSON.parse(value);

			if (JSON.stringify(currentObject.material.defines) !== JSON.stringify(json.defines)) {
				let cmd = new SetMaterialValueCommand(currentObject, 'defines', json.defines);
				cmd.updatable = false;
				editor.execute(cmd);
			}
			if (JSON.stringify(currentObject.material.uniforms) !== JSON.stringify(json.uniforms)) {
				let cmd = new SetMaterialValueCommand(currentObject, 'uniforms', json.uniforms);
				cmd.updatable = false;
				editor.execute(cmd);
			}
			if (JSON.stringify(currentObject.material.attributes) !== JSON.stringify(json.attributes)) {
				let cmd = new SetMaterialValueCommand(currentObject, 'attributes', json.attributes);
				cmd.updatable = false;
				editor.execute(cmd);
			}
		}, 300);
	});

	// prevent backspace from deleting objects
	let wrapper = codemirror.getWrapperElement();
	wrapper.addEventListener('keydown', function (event) {
		event.stopPropagation();
	});

	// validate

	let errorLines = [];
	let widgets = [];

	let validate = function (string) {
		let valid;
		let errors = [];

		return (codemirror.operation(function () {
			while (errorLines.length > 0)
				codemirror.removeLineClass(errorLines.shift(), 'background', 'errorLine');

			while (widgets.length > 0)
				codemirror.removeLineWidget(widgets.shift());

			//

			switch (currentMode) {
				case 'javascript':
					try {
						let syntax = esprima.parse(string, { tolerant: true });
						errors = syntax.errors;
					}
					catch (error) {
						errors.push({
							lineNumber: error.lineNumber - 1,
							message: error.message
						});
					}

					for (let i = 0; i < errors.length; i++) {
						let error = errors[i];
						error.message = error.message.replace(/Line [0-9]+: /, '');
					}
					break;
				case 'json':
					errors = [];

					jsonlint.parseError = function (message, info) {
						message = message.split('\n')[3];

						errors.push({
							lineNumber: info.loc.first_line - 1,
							message: message
						});
					};

					try {
						jsonlint.parse(string);
					}
					catch (error) { /* ignore failed error recovery */ }
					break;
				case 'glsl':
					try {
						let shaderType = (currentScript === 'vertexShader' ? glslprep.Shader.VERTEX : glslprep.Shader.FRAGMENT);

						glslprep.parseGlsl(string, shaderType);
					}
					catch(error) {
						if (error instanceof glslprep.SyntaxError)
							errors.push({
								lineNumber: error.line,
								message: "Syntax Error: " + error.message
							});
						else
							console.error(error.stack || error);
					}

					if (errors.length !== 0)
						break;
					if (renderer instanceof THREE.WebGLRenderer === false)
						break;

					currentObject.material[currentScript] = string;
					currentObject.material.needsUpdate = true;
					signals.materialChanged.dispatch(currentObject.material);

					let programs = renderer.info.programs;

					valid = true;
					let parseMessage = /^(?:ERROR|WARNING): \d+:(\d+): (.*)/g;

					for (let i = 0, n = programs.length; i !== n; ++i) {
						let diagnostics = programs[i].diagnostics;

						if (diagnostics === undefined || diagnostics.material !== currentObject.material)
							continue;

						if (!diagnostics.runnable)
							valid = false;

						let shaderInfo = diagnostics[currentScript];
						let lineOffset = shaderInfo.prefix.split(/\r\n|\r|\n/).length;

						while (true) {
							let parseResult = parseMessage.exec(shaderInfo.log);
							if (parseResult === null)
								break;

							errors.push({
								lineNumber: parseResult[1] - lineOffset,
								message: parseResult[2]
							});
						} // messages
						break;
					} // programs
			} // mode switch

			for (let i = 0; i < errors.length; i++) {
				let error = errors[i];

				let message = document.createElement('div');
				message.className = 'esprima-error';
				message.textContent = error.message;

				let lineNumber = Math.max(error.lineNumber, 0);
				errorLines.push(lineNumber);

				codemirror.addLineClass(lineNumber, 'background', 'errorLine');

				let widget = codemirror.addLineWidget(lineNumber, message);

				widgets.push(widget);
			}

			return valid !== undefined ? valid : errors.length === 0;
		}));
	};

	// tern js autocomplete

	let server = new CodeMirror.TernServer({
		caseInsensitive: true,
		plugins: { threejs: null }
	});

	codemirror.setOption('extraKeys', {
		'Ctrl-Space': function (cm) { server.complete(cm); },
		'Ctrl-I': function (cm) { server.showType(cm); },
		'Ctrl-O': function (cm) { server.showDocs(cm); },
		'Alt-.': function (cm) { server.jumpToDef(cm); },
		'Alt-,': function (cm) { server.jumpBack(cm); },
		'Ctrl-Q': function (cm) { server.rename(cm); },
		'Ctrl-.': function (cm) { server.selectName(cm); }
	});

	codemirror.on('cursorActivity', function (cm) {
		if (currentMode !== 'javascript')
			return ;
		server.updateArgHints(cm);
	});

	codemirror.on('keypress', function (cm, kb) {
		if (currentMode !== 'javascript')
			return ;
		let typed = String.fromCharCode(kb.which || kb.keyCode);
		if (/[\w\.]/.exec(typed))
			server.complete(cm);
	});

	//

	signals.editorCleared.add(function () {
		container.dom.style.display = 'none';
	});

	this.editScript = function (object, script) {
        let mode, name, source;

        if (typeof(script) === 'object') {
            mode = 'javascript';
            name = script.name;
            source = script.source;
            title.setValue(object.name + ' / ' + name);
        }
        else {
            switch (script) {
                case 'vertexShader':
                    mode = 'glsl';
                    name = 'Vertex Shader';
                    source = object.material.vertexShader || "";
                    break;
                case 'fragmentShader':
                    mode = 'glsl';
                    name = 'Fragment Shader';
                    source = object.material.fragmentShader || "";
                    break;
                case 'programInfo':
                    mode = 'json';
                    name = 'Program Properties';
                    let json = {
                        defines: object.material.defines,
                        uniforms: object.material.uniforms,
                        attributes: object.material.attributes
                    };
                    source = JSON.stringify(json, null, '\t');
                    break;
            }
            title.setValue(object.material.name + ' / ' + name);
        }

        currentMode = mode;
        currentScript = script;
        currentObject = object;

        container.dom.style.display = '';
        codemirror.setValue(source);
        codemirror.clearHistory();
        if (mode === 'json')
            mode = { name: 'javascript', json: true };
        codemirror.setOption('mode', mode);
    };

	eventHub.on('editScript', this.editScript);

	signals.scriptRemoved.add(function (script) {
		if (currentScript === script)
			container.dom.style.display = 'none';
	});

	return (container);
};
