/**
 * @author mrdoob / http://mrdoob.com/
 */

let Viewport = function (editor, container) {
	let eventHub = container.layoutManager.eventHub;
	let signals = editor.signals;

	container.dom = container.getElement()[0];
    container.dom.className = 'Panel';
    container.dom.id = 'viewport';
    container.dom.style.position = 'relative';

    let viewportInfoDom = document.createElement('div');
	container.dom.append((new Viewport.Info(editor, viewportInfoDom)).dom);

	//

	let renderer = null;

	let camera = editor.camera;
	let scene = editor.scene;
	let sceneHelpers = editor.sceneHelpers;

	let objects = [];

	//

	let vrEffect, vrControls;

	if (WEBVR.isAvailable() === true) {
		let vrCamera = new THREE.PerspectiveCamera();
		vrCamera.projectionMatrix = camera.projectionMatrix;
		camera.add(vrCamera);
	}

	// helpers

	let grid = new THREE.GridHelper(60, 60);
	sceneHelpers.add(grid);

	//

	let box = new THREE.Box3();

	let selectionBox = new THREE.BoxHelper();
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add(selectionBox);

	let objectPositionOnDown = null;
	let objectRotationOnDown = null;
	let objectScaleOnDown = null;

	let transformControls = new THREE.TransformControls(camera, container.dom);

	transformControls.addEventListener('change', function () {
		let object = transformControls.object;

		if (object !== undefined) {
			selectionBox.setFromObject(object);
			if (editor.helpers[object.id] !== undefined)
				editor.helpers[object.id].update();
			signals.refreshSidebarObject3D.dispatch(object);
		}
		render();
	});

	transformControls.addEventListener('mouseDown', function () {
		let object = transformControls.object;

		objectPositionOnDown = object.position.clone();
		objectRotationOnDown = object.rotation.clone();
		objectScaleOnDown = object.scale.clone();

		controls.enabled = false;
	});

	transformControls.addEventListener('mouseUp', function () {
		let object = transformControls.object;

		if (object !== undefined) {
			switch (transformControls.getMode()) {
				case 'translate':
					if (!objectPositionOnDown.equals(object.position))
						editor.execute( new SetPositionCommand( object, object.position, objectPositionOnDown ) );
					break;
				case 'rotate':
					if (!objectRotationOnDown.equals(object.rotation))
						editor.execute( new SetRotationCommand( object, object.rotation, objectRotationOnDown ) );
					break;
				case 'scale':
					if (!objectScaleOnDown.equals(object.scale))
						editor.execute(new SetScaleCommand(object, object.scale, objectScaleOnDown));
					break;
			}
		}
		controls.enabled = true;
	});

	sceneHelpers.add(transformControls);

	// object picking

	let raycaster = new THREE.Raycaster();
	let mouse = new THREE.Vector2();

	// events

	function getIntersects(point, objects) {
		mouse.set((point.x * 2) - 1, -(point.y * 2) + 1);
		raycaster.setFromCamera(mouse, camera);
		return (raycaster.intersectObjects(objects));
	}

	let onDownPosition = new THREE.Vector2();
	let onUpPosition = new THREE.Vector2();
	let onDoubleClickPosition = new THREE.Vector2();

	function getMousePosition(dom, x, y) {
		let rect = dom.getBoundingClientRect();
		return ([ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ]);
	}

	function handleClick() {
		if (onDownPosition.distanceTo(onUpPosition) === 0) {
			let intersects = getIntersects(onUpPosition, objects);
			if (intersects.length > 0) {
				let object = intersects[0].object;
				if (object.userData.object !== undefined)
					editor.select(object.userData.object); // helper
				else
					editor.select(object);
			} else
				editor.select(null);
			render();
		}
	}

	function onMouseDown(event) {
		event.preventDefault();
		let array = getMousePosition(container.dom, event.clientX, event.clientY);
		onDownPosition.fromArray(array);
		document.addEventListener('mouseup', onMouseUp, false);
	}

	function onMouseUp(event) {
		let array = getMousePosition(container.dom, event.clientX, event.clientY);
		onUpPosition.fromArray(array);
		handleClick();
		document.removeEventListener('mouseup', onMouseUp, false);
	}

	function onTouchStart(event) {
		let touch = event.changedTouches[0];
		let array = getMousePosition(container.dom, touch.clientX, touch.clientY);
		onDownPosition.fromArray(array);
		document.addEventListener('touchend', onTouchEnd, false);
	}

	function onTouchEnd(event) {
		let touch = event.changedTouches[0];
		let array = getMousePosition(container.dom, touch.clientX, touch.clientY);
		onUpPosition.fromArray(array);
		handleClick();
		document.removeEventListener('touchend', onTouchEnd, false);
	}

	function onDoubleClick(event) {
		let array = getMousePosition(container.dom, event.clientX, event.clientY);
		onDoubleClickPosition.fromArray(array);
		let intersects = getIntersects(onDoubleClickPosition, objects);

		if (intersects.length > 0) {
			let intersect = intersects[0];
			signals.objectFocused.dispatch(intersect.object);
		}
	}

	container.dom.addEventListener('mousedown', onMouseDown, false);
	container.dom.addEventListener('touchstart', onTouchStart, false);
	container.dom.addEventListener('dblclick', onDoubleClick, false);

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.

	let controls = new THREE.EditorControls(camera, container.dom);
	controls.addEventListener('change', function () {
		transformControls.update();
		signals.cameraChanged.dispatch(camera);
	});

	// signals

	signals.editorCleared.add(function () {
		controls.center.set(0, 0, 0);
		render();
	});

	signals.enterVR.add(function () {
		vrEffect.isPresenting ? vrEffect.exitPresent() : vrEffect.requestPresent();
	});

	signals.themeChanged.add(function (value) {
		switch (value) {
			case 'css/light.css':
				sceneHelpers.remove(grid);
				grid = new THREE.GridHelper(60, 60, 0x444444, 0x888888);
				sceneHelpers.add(grid);
				break;
			case 'css/dark.css':
				sceneHelpers.remove(grid);
				grid = new THREE.GridHelper(60, 60, 0xbbbbbb, 0x888888);
				sceneHelpers.add(grid);
				break;
		}
		render();
	});

	signals.transformModeChanged.add(function (mode) {
		transformControls.setMode(mode);
	});

	signals.snapChanged.add(function (dist) {
		transformControls.setTranslationSnap(dist);
	});

	signals.spaceChanged.add(function (space) {
		transformControls.setSpace(space);
	});

	eventHub.on('rendererChanged', (newRenderer) => {
        if (renderer !== null)
            container.dom.removeChild(renderer.domElement);
        renderer = newRenderer;
        renderer.autoClear = false;
        renderer.autoUpdateScene = false;
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);

        container.dom.appendChild(renderer.domElement);

        if (WEBVR.isAvailable() === true) {
            vrControls = new THREE.VRControls(vrCamera);
            vrEffect = new THREE.VREffect(renderer);
            window.addEventListener('vrdisplaypresentchange', function (event) {
                effect.isPresenting ? signals.enteredVR.dispatch() : signals.exitedVR.dispatch();
            }, false);
        }
        render();
	});

	signals.sceneGraphChanged.add(function () {
		render();
	});

	signals.cameraChanged.add(function () {
		render();
	});

	signals.objectSelected.add(function (object) {
		selectionBox.visible = false;
		transformControls.detach();
		if (object !== null && object !== scene && object !== camera) {
			box.setFromObject(object);
			if (box.isEmpty() === false) {
				selectionBox.setFromObject(object);
				selectionBox.visible = true;
			}
			transformControls.attach(object);
		}
		render();
	});

	signals.objectFocused.add(function (object) {
		controls.focus(object);
	});

	signals.geometryChanged.add(function (object) {
		if (object !== undefined)
			selectionBox.setFromObject(object);
		render();
	});

	signals.objectAdded.add(function (object) {
		object.traverse(function (child) {
			objects.push(child);
		});
	});

	signals.objectChanged.add(function (object) {
		if (editor.selected === object) {
			selectionBox.setFromObject(object);
			transformControls.update();
		}
		if (object instanceof THREE.PerspectiveCamera)
			object.updateProjectionMatrix();
		if (editor.helpers[object.id] !== undefined)
			editor.helpers[object.id].update();
		render();
	});

	signals.objectRemoved.add(function (object) {
		object.traverse(function (child) {
			objects.splice(objects.indexOf(child), 1);
		});
	});

	signals.helperAdded.add(function (object) {
		objects.push(object.getObjectByName('picker'));
	});

	signals.helperRemoved.add(function (object) {
		objects.splice(objects.indexOf(object.getObjectByName('picker')), 1);
	});

	signals.materialChanged.add(function (material) {
		render();
	});

	// fog

	signals.sceneBackgroundChanged.add(function (backgroundColor) {
		scene.background.setHex(backgroundColor);
		render();
	});

	let currentFogType = null;

	signals.sceneFogChanged.add(function (fogType, fogColor, fogNear, fogFar, fogDensity) {
		if (currentFogType !== fogType) {
			switch (fogType) {
				case 'None':
					scene.fog = null;
					break;
				case 'Fog':
					scene.fog = new THREE.Fog();
					break;
				case 'FogExp2':
					scene.fog = new THREE.FogExp2();
					break;
			}
			currentFogType = fogType;
		}
		if (scene.fog instanceof THREE.Fog) {
			scene.fog.color.setHex(fogColor);
			scene.fog.near = fogNear;
			scene.fog.far = fogFar;
		}
		else if (scene.fog instanceof THREE.FogExp2) {
			scene.fog.color.setHex(fogColor);
			scene.fog.density = fogDensity;
		}
		render();
	});

	//

	container.on('resize', () => {
        editor.DEFAULT_CAMERA.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
        editor.DEFAULT_CAMERA.updateProjectionMatrix();

        camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);

        render();
	});

	signals.showGridChanged.add(function (showGrid) {
		grid.visible = showGrid;
		render();
	});

	//

	function animate() {
		requestAnimationFrame(animate);
		if (vrEffect && vrEffect.isPresenting)
			render();
	}

	function render() {
		sceneHelpers.updateMatrixWorld();
		scene.updateMatrixWorld();

		if (vrEffect && vrEffect.isPresenting) {
			vrControls.update();
			camera.updateMatrixWorld();
			vrEffect.render(scene, vrCamera);
			vrEffect.render(sceneHelpers, vrCamera);
		}
		else {
			renderer.render(scene, camera);
			if (renderer instanceof THREE.RaytracingRenderer === false)
				renderer.render(sceneHelpers, camera);
		}
	}
	requestAnimationFrame(animate);
	return (container);
};
