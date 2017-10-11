/**
 * @author mrdoob / http://mrdoob.com/
 */

Sidebar.Object = function (editor) {
	let signals = editor.signals;

	let container = new UI.Panel();
	container.setBorderTop('0');
	container.setPaddingTop('20px');
	container.setDisplay('none');

	// Actions

	let objectActions = new UI.Select().setPosition('absolute').setRight('8px').setFontSize('11px');
	objectActions.setOptions({
		'Actions': 'Actions',
		'Reset Position': 'Reset Position',
		'Reset Rotation': 'Reset Rotation',
		'Reset Scale': 'Reset Scale'
	});
	objectActions.onClick(function (event) {
		event.stopPropagation(); // Avoid panel collapsing
	});
	objectActions.onChange(function (event) {
		let object = editor.selected;

		switch (this.getValue()) {
			case 'Reset Position':
				editor.execute(new SetPositionCommand(object, new THREE.Vector3(0, 0, 0)));
				break;

			case 'Reset Rotation':
				editor.execute(new SetRotationCommand(object, new THREE.Euler(0, 0, 0)));
				break;

			case 'Reset Scale':
				editor.execute(new SetScaleCommand(object, new THREE.Vector3(1, 1, 1)));
				break;
		}

		this.setValue('Actions');
	});
	//container.add(objectActions);

	let resetRow = new UI.Row();

	resetRow.add(new UI.Text('Reset').setWidth('90px'));
	resetRow.add(new UI.Button('Position').setMarginLeft('4px').onClick(function (event) {
		editor.execute(new SetPositionCommand(editor.selected, new THREE.Vector3(0, 0, 0)));
	}));
	resetRow.add(new UI.Button('Rotation').setMarginLeft('4px').onClick(function (event) {
		editor.execute(new SetRotationCommand(editor.selected, new THREE.Euler(0, 0, 0)));
	}));
	resetRow.add(new UI.Button('Scale').setMarginLeft('4px').onClick(function (event) {
		editor.execute(new SetScaleCommand(editor.selected, new THREE.Vector3(1, 1, 1)));
	}));
	container.add(resetRow);

	// type

	let objectTypeRow = new UI.Row();
	let objectType = new UI.Text();

	objectTypeRow.add(new UI.Text('Type').setWidth('90px'));
	objectTypeRow.add(objectType);

	container.add(objectTypeRow);

	// uuid

	let objectUUIDRow = new UI.Row();
	let objectUUID = new UI.Input().setWidth('102px').setFontSize('12px').setDisabled(true);
	let objectUUIDRenew = new UI.Button('New').setMarginLeft('7px').onClick(function () {
		objectUUID.setValue(THREE.Math.generateUUID());

		editor.execute(new SetUuidCommand(editor.selected, objectUUID.getValue()));
	});

	objectUUIDRow.add(new UI.Text('UUID').setWidth('90px'));
	objectUUIDRow.add(objectUUID);
	objectUUIDRow.add(objectUUIDRenew);

	container.add(objectUUIDRow);

	// name

	let objectNameRow = new UI.Row();
	let objectName = new UI.Input().setWidth('150px').setFontSize('12px').onChange(function () {
		editor.execute(new SetValueCommand(editor.selected, 'name', objectName.getValue()));
	});

	objectNameRow.add(new UI.Text('Name').setWidth('90px'));
	objectNameRow.add(objectName);

	container.add(objectNameRow);

	// position

	let objectPositionRow = new UI.Row();
	let objectPositionX = new UI.Number().setWidth('50px').onChange(update);
	let objectPositionY = new UI.Number().setWidth('50px').onChange(update);
	let objectPositionZ = new UI.Number().setWidth('50px').onChange(update);

	objectPositionRow.add(new UI.Text('Position').setWidth('90px'));
	objectPositionRow.add(objectPositionX, objectPositionY, objectPositionZ);

	container.add(objectPositionRow);

	// rotation

	let objectRotationRow = new UI.Row();
	let objectRotationX = new UI.Number().setStep(10).setUnit('°').setWidth('50px').onChange(update);
	let objectRotationY = new UI.Number().setStep(10).setUnit('°').setWidth('50px').onChange(update);
	let objectRotationZ = new UI.Number().setStep(10).setUnit('°').setWidth('50px').onChange(update);

	objectRotationRow.add(new UI.Text('Rotation').setWidth('90px'));
	objectRotationRow.add(objectRotationX, objectRotationY, objectRotationZ);

	container.add(objectRotationRow);

	// scale

	let objectScaleRow = new UI.Row();
	let objectScaleLock = new UI.Checkbox(true).setPosition('absolute').setLeft('75px');
	let objectScaleX = new UI.Number(1).setRange(0.01, Infinity).setWidth('50px').onChange(updateScaleX);
	let objectScaleY = new UI.Number(1).setRange(0.01, Infinity).setWidth('50px').onChange(updateScaleY);
	let objectScaleZ = new UI.Number(1).setRange(0.01, Infinity).setWidth('50px').onChange(updateScaleZ);

	objectScaleRow.add(new UI.Text('Scale').setWidth('90px'));
	objectScaleRow.add(objectScaleLock);
	objectScaleRow.add(objectScaleX, objectScaleY, objectScaleZ);

	container.add(objectScaleRow);

	// fov

	let objectFovRow = new UI.Row();
	let objectFov = new UI.Number().onChange(update);

	objectFovRow.add(new UI.Text('Fov').setWidth('90px'));
	objectFovRow.add(objectFov);

	container.add(objectFovRow);

	// near

	let objectNearRow = new UI.Row();
	let objectNear = new UI.Number().onChange(update);

	objectNearRow.add(new UI.Text('Near').setWidth('90px'));
	objectNearRow.add(objectNear);

	container.add(objectNearRow);

	// far

	let objectFarRow = new UI.Row();
	let objectFar = new UI.Number().onChange(update);

	objectFarRow.add(new UI.Text('Far').setWidth('90px'));
	objectFarRow.add(objectFar);

	container.add(objectFarRow);

	// intensity

	let objectIntensityRow = new UI.Row();
	let objectIntensity = new UI.Number().setRange(0, Infinity).onChange(update);

	objectIntensityRow.add(new UI.Text('Intensity').setWidth('90px'));
	objectIntensityRow.add(objectIntensity);

	container.add(objectIntensityRow);

	// color

	let objectColorRow = new UI.Row();
	let objectColor = new UI.Color().onChange(update);

	objectColorRow.add(new UI.Text('Color').setWidth('90px'));
	objectColorRow.add(objectColor);

	container.add(objectColorRow);

	// ground color

	let objectGroundColorRow = new UI.Row();
	let objectGroundColor = new UI.Color().onChange(update);

	objectGroundColorRow.add(new UI.Text('Ground color').setWidth('90px'));
	objectGroundColorRow.add(objectGroundColor);

	container.add(objectGroundColorRow);

	// distance

	let objectDistanceRow = new UI.Row();
	let objectDistance = new UI.Number().setRange(0, Infinity).onChange(update);

	objectDistanceRow.add(new UI.Text('Distance').setWidth('90px'));
	objectDistanceRow.add(objectDistance);

	container.add(objectDistanceRow);

	// angle

	let objectAngleRow = new UI.Row();
	let objectAngle = new UI.Number().setPrecision(3).setRange(0, Math.PI / 2).onChange(update);

	objectAngleRow.add(new UI.Text('Angle').setWidth('90px'));
	objectAngleRow.add(objectAngle);

	container.add(objectAngleRow);

	// penumbra

	let objectPenumbraRow = new UI.Row();
	let objectPenumbra = new UI.Number().setRange(0, 1).onChange(update);

	objectPenumbraRow.add(new UI.Text('Penumbra').setWidth('90px'));
	objectPenumbraRow.add(objectPenumbra);

	container.add(objectPenumbraRow);

	// decay

	let objectDecayRow = new UI.Row();
	let objectDecay = new UI.Number().setRange(0, Infinity).onChange(update);

	objectDecayRow.add(new UI.Text('Decay').setWidth('90px'));
	objectDecayRow.add(objectDecay);

	container.add(objectDecayRow);

	// shadow

	let objectShadowRow = new UI.Row();

	objectShadowRow.add(new UI.Text('Shadow').setWidth('90px'));

	let objectCastShadow = new UI.THREE.Boolean(false, 'cast').onChange(update);
	objectShadowRow.add(objectCastShadow);

	let objectReceiveShadow = new UI.THREE.Boolean(false, 'receive').onChange(update);
	objectShadowRow.add(objectReceiveShadow);

	let objectShadowRadius = new UI.Number(1).onChange(update);
	objectShadowRow.add(objectShadowRadius);

	container.add(objectShadowRow);

	// visible

	let objectVisibleRow = new UI.Row();
	let objectVisible = new UI.Checkbox().onChange(update);

	objectVisibleRow.add(new UI.Text('Visible').setWidth('90px'));
	objectVisibleRow.add(objectVisible);

	container.add(objectVisibleRow);

	// user data

	let timeout;

	let objectUserDataRow = new UI.Row();
	let objectUserData = new UI.TextArea().setWidth('150px').setHeight('40px').setFontSize('12px').onChange(update);
	objectUserData.onKeyUp(function () {
		try {
			JSON.parse( objectUserData.getValue() );

			objectUserData.dom.classList.add('success');
			objectUserData.dom.classList.remove('fail');
		}
		catch (error) {
			objectUserData.dom.classList.remove('success');
			objectUserData.dom.classList.add('fail');
		}
	});

	objectUserDataRow.add(new UI.Text('User data').setWidth('90px'));
	objectUserDataRow.add(objectUserData);

	container.add(objectUserDataRow);

	//

	function updateScaleX() {
		let object = editor.selected;

		if (objectScaleLock.getValue() === true) {
			let scale = objectScaleX.getValue() / object.scale.x;

			objectScaleY.setValue(objectScaleY.getValue() * scale);
			objectScaleZ.setValue(objectScaleZ.getValue() * scale);
		}

		update();
	}

	function updateScaleY() {
		let object = editor.selected;

		if (objectScaleLock.getValue() === true) {
			let scale = objectScaleY.getValue() / object.scale.y;

			objectScaleX.setValue(objectScaleX.getValue() * scale);
			objectScaleZ.setValue(objectScaleZ.getValue() * scale);
		}

		update();
	}

	function updateScaleZ() {
		let object = editor.selected;

		if (objectScaleLock.getValue() === true) {
			let scale = objectScaleZ.getValue() / object.scale.z;

			objectScaleX.setValue(objectScaleX.getValue() * scale);
			objectScaleY.setValue(objectScaleY.getValue() * scale);
		}

		update();
	}

	function update() {
		let object = editor.selected;

		if (object !== null) {
			let newPosition = new THREE.Vector3(objectPositionX.getValue(), objectPositionY.getValue(), objectPositionZ.getValue());
			if (object.position.distanceTo(newPosition) >= 0.01)
				editor.execute(new SetPositionCommand(object, newPosition));

			let newRotation = new THREE.Euler(objectRotationX.getValue() * THREE.Math.DEG2RAD, objectRotationY.getValue() * THREE.Math.DEG2RAD, objectRotationZ.getValue() * THREE.Math.DEG2RAD);
			if (object.rotation.toVector3().distanceTo(newRotation.toVector3()) >= 0.01)
				editor.execute(new SetRotationCommand(object, newRotation));

			let newScale = new THREE.Vector3( objectScaleX.getValue(), objectScaleY.getValue(), objectScaleZ.getValue() );
			if (object.scale.distanceTo(newScale) >= 0.01)
				editor.execute(new SetScaleCommand(object, newScale));

			if (object.fov !== undefined && Math.abs(object.fov - objectFov.getValue()) >= 0.01) {
				editor.execute(new SetValueCommand(object, 'fov', objectFov.getValue()));
				object.updateProjectionMatrix();
			}

			if (object.near !== undefined && Math.abs(object.near - objectNear.getValue()) >= 0.01)
				editor.execute(new SetValueCommand(object, 'near', objectNear.getValue()));

			if (object.far !== undefined && Math.abs(object.far - objectFar.getValue()) >= 0.01)
				editor.execute(new SetValueCommand(object, 'far', objectFar.getValue()));

			if (object.intensity !== undefined && Math.abs(object.intensity - objectIntensity.getValue()) >= 0.01)
				editor.execute(new SetValueCommand(object, 'intensity', objectIntensity.getValue()));

			if (object.color !== undefined && object.color.getHex() !== objectColor.getHexValue())
				editor.execute(new SetColorCommand( object, 'color', objectColor.getHexValue() ) );

			if (object.groundColor !== undefined && object.groundColor.getHex() !== objectGroundColor.getHexValue())
				editor.execute(new SetColorCommand(object, 'groundColor', objectGroundColor.getHexValue()));

			if (object.distance !== undefined && Math.abs(object.distance - objectDistance.getValue()) >= 0.01)
				editor.execute(new SetValueCommand(object, 'distance', objectDistance.getValue()));

			if (object.angle !== undefined && Math.abs(object.angle - objectAngle.getValue()) >= 0.01)
				editor.execute(new SetValueCommand(object, 'angle', objectAngle.getValue()));

			if (object.penumbra !== undefined && Math.abs(object.penumbra - objectPenumbra.getValue()) >= 0.01)
				editor.execute(new SetValueCommand(object, 'penumbra', objectPenumbra.getValue()));

			if (object.decay !== undefined && Math.abs(object.decay - objectDecay.getValue()) >= 0.01)
				editor.execute( new SetValueCommand( object, 'decay', objectDecay.getValue() ) );

			if (object.visible !== objectVisible.getValue())
				editor.execute(new SetValueCommand(object, 'visible', objectVisible.getValue()));

			if (object.castShadow !== undefined && object.castShadow !== objectCastShadow.getValue())
				editor.execute(new SetValueCommand(object, 'castShadow', objectCastShadow.getValue()));

			if (object.receiveShadow !== undefined && object.receiveShadow !== objectReceiveShadow.getValue()) {
				editor.execute(new SetValueCommand(object, 'receiveShadow', objectReceiveShadow.getValue()));
				object.material.needsUpdate = true;
			}

			if (object.shadow !== undefined)
				if (object.shadow.radius !== objectShadowRadius.getValue())
					editor.execute(new SetValueCommand(object.shadow, 'radius', objectShadowRadius.getValue()));

			try {
				let userData = JSON.parse(objectUserData.getValue());
				if (JSON.stringify(object.userData) != JSON.stringify(userData))
					editor.execute( new SetValueCommand(object, 'userData', userData));
			}
			catch (exception) {
				console.warn(exception);
			}
		}
	}

	function updateRows(object) {
		let properties = {
			'fov': objectFovRow,
			'near': objectNearRow,
			'far': objectFarRow,
			'intensity': objectIntensityRow,
			'color': objectColorRow,
			'groundColor': objectGroundColorRow,
			'distance' : objectDistanceRow,
			'angle' : objectAngleRow,
			'penumbra' : objectPenumbraRow,
			'decay' : objectDecayRow,
			'castShadow' : objectShadowRow,
			'receiveShadow' : objectReceiveShadow,
			'shadow': objectShadowRadius
		};

		for (let property in properties)
			properties[property].setDisplay(object[property] !== undefined ? '' : 'none');
	}

	function updateTransformRows(object) {
        if (object instanceof THREE.Light ||
            (object instanceof THREE.Object3D && object.userData.targetInverse)) {
			objectRotationRow.setDisplay('none');
			objectScaleRow.setDisplay('none');
		}
		else {
			objectRotationRow.setDisplay('');
			objectScaleRow.setDisplay('');
		}
	}

	// events

	signals.objectSelected.add(function (object) {
		if (object !== null) {
			container.setDisplay('block');

			updateRows(object);
			updateUI(object);
		}
		else
			container.setDisplay('none');
	});

	signals.objectChanged.add(function (object) {
		if (object !== editor.selected)
			return ;

		updateUI(object);
	});

	signals.refreshSidebarObject3D.add(function (object) {
		if (object !== editor.selected)
			return;

		updateUI(object);
	});

	function updateUI(object) {
		objectType.setValue(object.type);

		objectUUID.setValue(object.uuid);
		objectName.setValue(object.name);

		objectPositionX.setValue(object.position.x);
		objectPositionY.setValue(object.position.y);
		objectPositionZ.setValue(object.position.z);

		objectRotationX.setValue(object.rotation.x * THREE.Math.RAD2DEG);
		objectRotationY.setValue(object.rotation.y * THREE.Math.RAD2DEG);
		objectRotationZ.setValue(object.rotation.z * THREE.Math.RAD2DEG);

		objectScaleX.setValue(object.scale.x);
		objectScaleY.setValue(object.scale.y);
		objectScaleZ.setValue(object.scale.z);

		if (object.fov !== undefined)
			objectFov.setValue(object.fov);

		if (object.near !== undefined)
			objectNear.setValue(object.near);

		if (object.far !== undefined)
			objectFar.setValue(object.far);

		if (object.intensity !== undefined)
			objectIntensity.setValue(object.intensity);

		if (object.color !== undefined)
			objectColor.setHexValue(object.color.getHexString());

		if (object.groundColor !== undefined)
			objectGroundColor.setHexValue(object.groundColor.getHexString());

		if (object.distance !== undefined)
			objectDistance.setValue(object.distance);

		if (object.angle !== undefined)
			objectAngle.setValue(object.angle);

		if (object.penumbra !== undefined)
			objectPenumbra.setValue(object.penumbra);

		if (object.decay !== undefined)
			objectDecay.setValue(object.decay);

		if (object.castShadow !== undefined)
			objectCastShadow.setValue(object.castShadow);

		if (object.receiveShadow !== undefined)
			objectReceiveShadow.setValue(object.receiveShadow);

		if (object.shadow !== undefined)
			objectShadowRadius.setValue(object.shadow.radius);

		objectVisible.setValue(object.visible);

		try {
			objectUserData.setValue(JSON.stringify(object.userData, null, '  '));
		}
		catch (error) {
			console.log(error);
		}

		objectUserData.setBorderColor('transparent');
		objectUserData.setBackgroundColor('');

		updateTransformRows(object);
	}

	return (container);
};
