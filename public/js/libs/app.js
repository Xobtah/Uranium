/**
 * @author mrdoob / http://mrdoob.com/
 */

let APP = {

	Player: function (editor, container) {
		let loader = new THREE.ObjectLoader();
		let camera, scene, renderer;

		let controls, effect, cameraVR, isVR;

		let events = {};

		this.dom = document.createElement('div');

		this.width = 500;
		this.height = 500;

		this.load = function (json) {
			isVR = json.project.vr;

			renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setClearColor(0x000000);
			renderer.setPixelRatio(window.devicePixelRatio);

			if (json.project.gammaInput)
				renderer.gammaInput = true;
			if (json.project.gammaOutput)
				renderer.gammaOutput = true;

			if (json.project.shadows) {
				renderer.shadowMap.enabled = true;
				// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
			}

			this.dom.appendChild(renderer.domElement);

			this.setScene(loader.parse(json.scene));
			this.setCamera(loader.parse(json.camera));

			events = {
				init: [],
				start: [], stop: [],
				keydown: [], keyup: [],
				mousedown: [], mouseup: [], mousemove: [],
				touchstart: [], touchend: [], touchmove: [],
				update: []
			};

			let scriptWrapParams = 'player,renderer,scene,camera';
			let scriptWrapResultObj = {};

			for (let eventKey in events) {
				scriptWrapParams += ',' + eventKey;
				scriptWrapResultObj[eventKey] = eventKey;
			}

			let scriptWrapResult = JSON.stringify(scriptWrapResultObj).replace(/\"/g, '');

			for (let uuid in json.scripts) {
				let object = scene.getObjectByProperty('uuid', uuid, true);

				if (object === undefined) {
					console.warn('APP.Player: Script without object.', uuid);
					continue;
				}

				let scripts = json.scripts[uuid];

				for (let i = 0; i < scripts.length; i++) {
					let script = scripts[i];

					let functions = (new Function(scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';').bind(object))(this, renderer, scene, camera);

					for (let name in functions) {
						if (functions[name] === undefined)
							continue;
						if (events[name] === undefined) {
							console.warn('APP.Player: Event type not supported (', name, ')');
							continue;
						}

						events[name].push(functions[name].bind(object));
					}
				}
			}

			dispatch(events.init, arguments);
		};

		this.setCamera = function (value) {
			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

			if (isVR === true) {
				cameraVR = new THREE.PerspectiveCamera();
				cameraVR.projectionMatrix = camera.projectionMatrix;
				camera.add(cameraVR);

				controls = new THREE.VRControls(cameraVR);
				effect = new THREE.VREffect(renderer);

				WEBVR.checkAvailability().then(() => {
                    this.dom.appendChild(WEBVR.getButton(effect));
				}).catch();
				if (WEBVR.isLatestAvailable() === false)
					this.dom.appendChild(WEBVR.getMessage());
			}
		};

		this.setScene = function (value) {
			scene = value;
		};

		this.setSize = function (width, height) {
			this.width = width;
			this.height = height;

			if (camera) {
				camera.aspect = this.width / this.height;
				camera.updateProjectionMatrix();
			}

			if (renderer)
				renderer.setSize(width, height);
		};

		function dispatch(array, event) {
			for (let i = 0, l = array.length; i < l; i++)
				array[i](event);
		}

		let prevTime, request;

		function animate(time) {
			request = requestAnimationFrame(animate);
			if (scene.simulate && typeof scene.simulate === 'function')
				scene.simulate();

			try {
				dispatch(events.update, { time: time, delta: time - prevTime });
			} catch (e) {
				console.error((e.message || e), (e.stack || ""));
			}

			if (isVR === true) {
				camera.updateMatrixWorld();

				controls.update();
				effect.render(scene, cameraVR);
			}
			else if (renderer)
                renderer.render(scene, camera);

			prevTime = time;
		}

		this.play = function () {
			document.addEventListener('keydown', onDocumentKeyDown);
			document.addEventListener('keyup', onDocumentKeyUp);
			document.addEventListener('mousedown', onDocumentMouseDown);
			document.addEventListener('mouseup', onDocumentMouseUp);
			document.addEventListener('mousemove', onDocumentMouseMove);
			document.addEventListener('touchstart', onDocumentTouchStart);
			document.addEventListener('touchend', onDocumentTouchEnd);
			document.addEventListener('touchmove', onDocumentTouchMove);

			dispatch(events.start, arguments);

			request = requestAnimationFrame(animate);
			prevTime = performance.now();
		};

		this.stop = function () {
			document.removeEventListener('keydown', onDocumentKeyDown);
			document.removeEventListener('keyup', onDocumentKeyUp);
			document.removeEventListener('mousedown', onDocumentMouseDown);
			document.removeEventListener('mouseup', onDocumentMouseUp);
			document.removeEventListener('mousemove', onDocumentMouseMove);
			document.removeEventListener('touchstart', onDocumentTouchStart);
			document.removeEventListener('touchend', onDocumentTouchEnd);
			document.removeEventListener('touchmove', onDocumentTouchMove);

			dispatch(events.stop, arguments);

			cancelAnimationFrame(request);
		};

		this.dispose = function () {
			while (this.dom.children.length)
				this.dom.removeChild(this.dom.firstChild);

			renderer.dispose();

			camera = undefined;
			scene = undefined;
			renderer = undefined;
		};

		//

		function onDocumentKeyDown(event) {
			dispatch(events.keydown, event);
		}

		function onDocumentKeyUp(event) {
			dispatch(events.keyup, event);
		}

		function onDocumentMouseDown(event) {
			dispatch(events.mousedown, event);
		}

		function onDocumentMouseUp(event) {
			dispatch(events.mouseup, event);
		}

		function onDocumentMouseMove(event) {
			dispatch(events.mousemove, event);
		}

		function onDocumentTouchStart(event) {
			dispatch(events.touchstart, event);
		}

		function onDocumentTouchEnd(event) {
			dispatch(events.touchend, event);
		}

		function onDocumentTouchMove(event) {
			dispatch(events.touchmove, event);
		}
	}

};
