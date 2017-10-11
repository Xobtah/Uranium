/**
 * Created by xobtah on 11/09/17.
 */

Sidebar.Physics = function (editor, object) {
	let signals = editor.signals;

	let container = new UI.Panel();
	container.setBorderTop('0');
	container.setPaddingTop('20px');

	// Rigidbody Activator

	let rigidbodyRow = new UI.Row();
	let objectRigidbody = new UI.Checkbox().onChange(update);

	rigidbodyRow.add(new UI.Text('Rigidbody').setWidth('90px'));
	rigidbodyRow.add(objectRigidbody);

	container.add(rigidbodyRow);

	// TODO: Fixing Serialization number & New / Copy / Paste
	/*
	// Serialization Manager New / Copy / Paste

	let managerRow = new UI.Row();

	managerRow.add(new UI.Text('').setWidth('90px'));

	managerRow.add(new UI.Button('New').onClick(function () {
		let material = new THREE[materialClass.getValue()]();
		editor.execute(new SetMaterialCommand(currentObject, material, currentMaterialSlot), 'New Material: ' + materialClass.getValue());
		update();
	}));

	managerRow.add(new UI.Button('Copy').setMarginLeft('4px').onClick(function () {
		copiedMaterial = currentObject.material;

		if (Array.isArray(copiedMaterial)) {
			if (copiedMaterial.length === 0)
				return ;
			copiedMaterial = copiedMaterial[currentMaterialSlot];
		}
	}));

	managerRow.add(new UI.Button('Paste').setMarginLeft('4px').onClick(function () {
		if (copiedMaterial === undefined)
			return ;

		editor.execute(new SetMaterialCommand(currentObject, copiedMaterial, currentMaterialSlot), 'Pasted Material: ' + materialClass.getValue());
		refreshUI();
		update();
	}));

	container.add(managerRow);
	*/

	// UUID Displayer

	let rigidbodyUUIDRow = new UI.Row();
	let rigidbodyUUID = new UI.Input().setWidth('102px').setFontSize('12px').setDisabled(true);
	let rigidbodyUUIDRenew = new UI.Button('New').setMarginLeft('7px').onClick(function () {
		rigidbodyUUID.setValue(THREE.Math.generateUUID());
		update();
	});

	rigidbodyUUIDRow.add(new UI.Text('UUID').setWidth('90px'));
	rigidbodyUUIDRow.add(rigidbodyUUID);
	rigidbodyUUIDRow.add(rigidbodyUUIDRenew);

	container.add(rigidbodyUUIDRow);

	// Colliders container

	let collidersContainer = new UI.Row();
	collidersContainer.clear();
	collidersContainer.setDisplay('none');
	container.add(collidersContainer);

	// Mass

	let massContainer = new UI.Row();

	massContainer.add(new UI.Text('Mass').setWidth('90px'));
	let objectMass = new UI.Number().setWidth('50px').onChange(function () {
		editor.selected.rigidbody.mass = this.getValue();
	});
	massContainer.add(objectMass);

	massContainer.setDisplay('none');
	container.add(massContainer);

	// New Collider TODO: Making new collider useful

	let newColliderContainer = new UI.Button('New');
	newColliderContainer.onClick(function () {
		editor.execute(new AddColliderCommand(editor.selected, { type: null }));
		refreshUI(editor.selected);
		update();
	});

	newColliderContainer.setDisplay('none');
	container.add(newColliderContainer);

	// events

	signals.objectSelected.add(function (object) {
		if (object !== null) {
			container.setDisplay('block');

			if (!object.rigidbody)
				object.rigidbody = new Rigidbody();

			setRowVisibility(object);
			refreshUI(object);
		}
		else
			container.setDisplay('none');
	});

	signals.objectChanged.add(function (object) {
		if (object !== editor.selected)
			return ;
		refreshUI(object);
	});

	signals.refreshSidebarObject3D.add(function (object) {
		if (object !== editor.selected)
			return ;
		refreshUI(object);
	});

	// Update Functions

	function setRowVisibility(object) {
		// TODO: Fix that
		/*object = object.rigidbody;
		let properties = {
			'active': newColliderContainer
		};

		for (let property in properties)
			properties[property].setDisplay(object[property] !== undefined ? '' : 'none');*/
	}

	function update() {
		collidersContainer.clear();
		collidersContainer.setDisplay('none');

		let object = editor.selected;

		if (object) {
			if (object.rigidbody.active !== objectRigidbody.getValue())
				editor.execute(new SetValueCommand(object.rigidbody, 'active', objectRigidbody.getValue()));

			// TODO: Create SetRigidbodyValueCommand
			/*if (object.rigidbody.uuid !== undefined && object.rigidbody.uuid !== rigidbodyUUID.getValue())
				editor.execute(new SetMaterialValueCommand(object.rigidbody, 'uuid', rigidbodyUUID.getValue(), currentMaterialSlot));*/
		}

		if (object.rigidbody.active && object.rigidbody.colliders.length) {
			collidersContainer.setDisplay('block');
			massContainer.setDisplay('block');

			for (let i = 0; i < object.rigidbody.colliders.length; i++) {
				// TODO: Add position, rotation and scale to rigidbodies
				(function (object, collider, colliderIndex) {
					let colliderType = new UI.Select();

					colliderType.setOptions({
						'Mesh': 'Mesh',
						'BoxMesh': 'Box Mesh',
						'SphereMesh': 'Sphere Mesh',
						'CylinderMesh': 'Cylinder Mesh',
						'ConeMesh': 'Cone Mesh',
						'CapsuleMesh': 'Capsule Mesh',
						'ConvexMesh': 'Convex Mesh',
						'ConcaveMesh': 'Concave Mesh',
						'HeightfieldMesh': 'Heightfield Mesh',
						'Mesh': 'Mesh'
					});
					colliderType.onClick(function (event) {
						event.stopPropagation(); // Avoid panel collapsing
					});
					colliderType.onChange(function (event) {
						editor.execute(new SetColliderCommand(object, { type: this.getValue() }, colliderIndex));
					});

					collidersContainer.add(new UI.Text('Type').setWidth('90px'));
					collidersContainer.add(colliderType);

					collidersContainer.add(new UI.Break());
				})(object, object.rigidbody.colliders[i], i)
			}
		}
	}

	function refreshUI(object) {
		if (object.rigidbody.uuid !== undefined)
			rigidbodyUUID.setValue(object.rigidbody.uuid);

		objectRigidbody.setValue(object.rigidbody.active);

		objectMass.setValue(object.rigidbody.mass);

		setRowVisibility(object);
	}

	return (container);
};
