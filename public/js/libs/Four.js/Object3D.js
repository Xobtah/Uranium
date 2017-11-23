THREE.Object3D.prototype.toJSON = function (meta) {
    let isRootObject = (meta === undefined || meta === '');

    let output = {};

    if (isRootObject) {
        meta = {
            geometries: {},
            materials: {},
            rigidbodies: {},
            textures: {},
            images: {}
        };

        output.metadata = {
            version: 4.5,
            type: 'Object',
            generator: 'Object3D.toJSON'
        };
    }

    let object = {};

    object.uuid = this.uuid;
    object.type = this.type;

    if (this.name !== '') object.name = this.name;
    if (JSON.stringify(this.userData) !== '{}') object.userData = this.userData;
    if (this.castShadow === true) object.castShadow = true;
    if (this.receiveShadow === true) object.receiveShadow = true;
    if (this.visible === false) object.visible = false;

    object.matrix = this.matrix.toArray();

    function serialize(library, element) {
        if (library[element.uuid] === undefined)
            library[element.uuid] = element.toJSON(meta);

        return (element.uuid);
    }

    if (this.geometry !== undefined)
        object.geometry = serialize(meta.geometries, this.geometry);

    if (this.material !== undefined) {
        if (Array.isArray(this.material)) {
            let uuids = [];

            for (let i = 0, l = this.material.length; i < l; i++)
                uuids.push( serialize(meta.materials, this.material[i]));
            object.material = uuids;
        }
        else
            object.material = serialize(meta.materials, this.material);
    }

    if (this.rigidbody !== undefined)
        object.rigidbody = serialize(meta.rigidbodies, this.rigidbody);
    /*if (this.rigidbody !== undefined)
        object.rigidbody = this.rigidbody;*/

    if (this.children.length > 0) {
        object.children = [];

        for (let i = 0; i < this.children.length; i++)
            object.children.push(this.children[i].toJSON(meta).object);
    }

    if (isRootObject) {
        let geometries = extractFromCache(meta.geometries);
        let materials = extractFromCache(meta.materials);
        let rigidbodies = extractFromCache(meta.rigidbodies);
        let textures = extractFromCache(meta.textures);
        let images = extractFromCache(meta.images);

        if (geometries.length > 0) output.geometries = geometries;
        if (materials.length > 0) output.materials = materials;
        if (rigidbodies.length > 0) output.rigidbodies = rigidbodies;
        if (textures.length > 0) output.textures = textures;
        if (images.length > 0) output.images = images;
    }

    output.object = object;

    return (output);

    function extractFromCache(cache) {
        let values = [];
        for (let key in cache) {
            let data = cache[key];
            delete data.metadata;
            values.push(data);
        }
        return (values);
    }
};
