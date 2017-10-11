/**
 * @author Xobtah / http://github.com/Xobtah
 */

let rigcount = 0;
function GeometryIdCount() { return (rigcount++); }

let Rigidbody = function () {
    Object.defineProperty(this, 'id', { value: GeometryIdCount() });

    function generateUUID() {
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		var uuid = new Array(36);
		var rnd = 0, r;

		for (let i = 0; i < 36; i++) {
			if (i === 8 || i === 13 || i === 18 || i === 23)
				uuid[i] = '-';
			else if (i === 14)
				uuid[ i ] = '4';
			else {
				if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
				r = rnd & 0xf;
				rnd = rnd >> 4;
				uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
			}
		}
		return (uuid.join(''));
	}

    this.active = false;

	this.uuid = generateUUID();

	this.name = '';
	this.type = 'Rigidbody';

    this.colliders = [ { type: null } ];
    this.mass = 0;
}

Rigidbody.prototype.toJSON = function (meta) {
    if (!this.active)
        return ({});

    let data = {
        metadata: {
            version: 4.5,
            type: 'Rigidbody',
            generator: 'Rigidbody.toJSON'
        }
    };

    data.uuid = this.uuid;
    data.type = this.type;
    if (this.name !== '')
        data.name = this.name;

    data.colliders = this.colliders;
    data.mass = this.mass;

    //data.data = {};

	return (data);
}

Rigidbody.prototype.fromJSON = function (json) {
    console.log('IMPLEMENT Rigidbody.prototype.fromJSON!!!!!');
}
