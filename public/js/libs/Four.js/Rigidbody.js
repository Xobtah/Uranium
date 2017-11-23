/**
 * @author Xobtah / http://github.com/Xobtah
 */

let rigcount = 0;
function GeometryIdCount() { return (rigcount++); }

let Rigidbody = function (rigidbody) {
    Object.defineProperty(this, 'id', { value: GeometryIdCount() });

    this.uuid = THREE.Math.generateUUID();
	this.type = 'Rigidbody';

    this.colliders = [];
    this.mass = 0;

    if (rigidbody) {
        this.uuid = rigidbody.uuid;
        this.colliders = rigidbody.colliders;
        this.mass = rigidbody.mass;
    }
}

Rigidbody.prototype.toJSON = function (meta) {
    let data = {
        metadata: {
            version: 4.5,
            type: 'Rigidbody',
            generator: 'Rigidbody.toJSON'
        }
    };

    data.uuid = this.uuid;
    data.type = this.type;

    data.colliders = this.colliders;
    data.mass = this.mass;

    //data.data = {};

	return (data);
}

Rigidbody.prototype.fromJSON = function (json) {
    console.log('IMPLEMENT Rigidbody.prototype.fromJSON!!!!!');
}
