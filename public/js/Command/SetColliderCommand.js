/**
 * @author xobtah / https://github.com/Xobtah
 */

let SetColliderCommand = function (object, collider, index) {
	Command.call(this);

	this.type = 'SetColliderCommand';

	this.object = object;
	if (object !== undefined)
		this.name = 'Add Collider to object: ' + object.name;
    this.collider = collider;
    this.index = index;
    this.oldCollider = this.object.rigidbody.colliders[this.index];
};

SetColliderCommand.prototype = {
	execute: function () {
		if (!this.object.rigidbody.colliders[this.index])
			this.object.rigidbody.colliders.push(this.collider);
		else
        	this.object.rigidbody.colliders[this.index] = this.collider;
		this.editor.signals.objectChanged.dispatch(this.object);
	},

	undo: function () {
        this.object.rigidbody.colliders[this.index] = this.oldCollider;
		this.editor.signals.objectChanged.dispatch(this.object);
	},

	toJSON: function () {
		let output = Command.prototype.toJSON.call(this);

		output.object = this.object.toJSON();
        output.collider = this.collider;
		return (output);
	},

	fromJSON: function (json) {
		Command.prototype.fromJSON.call(this, json);

		this.object = this.editor.objectByUuid(json.object.object.uuid);

		if (this.object === undefined) {
			let loader = new THREE.ObjectLoader();
			this.object = loader.parse(json.object);
		}
	}
};
