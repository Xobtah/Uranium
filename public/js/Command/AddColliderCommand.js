/**
 * @author xobtah / https://github.com/Xobtah
 */

let AddColliderCommand = function (object, collider) {
	Command.call(this);

	this.type = 'AddColliderCommand';

	this.object = object;
	if (object !== undefined)
		this.name = 'Add Collider to object: ' + object.name;
    this.collider = collider;
};

AddColliderCommand.prototype = {
	execute: function () {
        this.object.rigidbody.colliders.push(this.collider);
		this.editor.signals.objectChanged.dispatch(this.object);
	},

	undo: function () {
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
