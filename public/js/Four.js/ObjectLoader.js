THREE.ObjectLoader.prototype.parse = function (json, onLoad) {
    let geometries = this.parseGeometries(json.geometries);
    let rigidbodies = this.parseRigidbodies(json.rigidbodies);

    let images = this.parseImages(json.images, function () {
        if (onLoad !== undefined)
            onLoad(object);
    });

    let textures = this.parseTextures(json.textures, images);
    let materials = this.parseMaterials(json.materials, textures);

    let object = this.parseObject(json.object, geometries, materials, rigidbodies);

    if (json.animations)
        object.animations = this.parseAnimations(json.animations);

    if (json.images === undefined || json.images.length === 0)
        if (onLoad !== undefined)
            onLoad(object);

    return (object);
};

THREE.ObjectLoader.prototype.parseObject = function () {
    let matrix = new THREE.Matrix4();

    return (function parseObject(data, geometries, materials, rigidbodies) {
        let object;

        function getGeometry(name) {
            if (geometries[name] === undefined)
                console.warn('THREE.ObjectLoader: Undefined geometry', name);

            return (geometries[name]);
        }

        function getRigidbody(name) {
            if (!rigidbodies || !name) return (undefined);

            if (rigidbodies[name] === undefined)
                console.warn('THREE.ObjectLoader: Undefined Rigidbody', name);

            return (rigidbodies[name]);
        }

        function getMaterial(name) {
            if (name === undefined)
                return (undefined);

            if (Array.isArray(name)) {
                var array = [];

                for (var i = 0, l = name.length; i < l; i++) {
                    if (materials[name[i]] === undefined)
                        console.warn('THREE.ObjectLoader: Undefined material', name[i]);

                    array.push(materials[name[i]]);
                }

                return (array);
            }

            if (materials[name] === undefined)
                console.warn('THREE.ObjectLoader: Undefined material', name);

            return (materials[name]);
        }

        switch (data.type) {
            case 'Scene':
                object = new Physijs.Scene();

                if (data.background !== undefined)
                    if (Number.isInteger(data.background))
                        object.background = new THREE.Color( data.background );

                if (data.fog !== undefined) {
                    if (data.fog.type === 'Fog')
                        object.fog = new THREE.Fog(data.fog.color, data.fog.near, data.fog.far);
                    else if (data.fog.type === 'FogExp2')
                        object.fog = new THREE.FogExp2(data.fog.color, data.fog.density);
                }
                break;

            case 'PerspectiveCamera':
                object = new THREE.PerspectiveCamera(data.fov, data.aspect, data.near, data.far);

                if (data.focus !== undefined) object.focus = data.focus;
                if (data.zoom !== undefined) object.zoom = data.zoom;
                if (data.filmGauge !== undefined) object.filmGauge = data.filmGauge;
                if (data.filmOffset !== undefined) object.filmOffset = data.filmOffset;
                if (data.view !== undefined) object.view = Object.assign({}, data.view);
                break;

            case 'OrthographicCamera':
                object = new THREE.OrthographicCamera(data.left, data.right, data.top, data.bottom, data.near, data.far);
                break;

            case 'AmbientLight':
                object = new THREE.AmbientLight(data.color, data.intensity);
                break;

            case 'DirectionalLight':
                object = new THREE.DirectionalLight(data.color, data.intensity);
                break;

            case 'PointLight':
                object = new THREE.PointLight(data.color, data.intensity, data.distance, data.decay);
                break;

            case 'RectAreaLight':
                object = new THREE.RectAreaLight(data.color, data.intensity, data.width, data.height);
                break;

            case 'SpotLight':
                object = new THREE.SpotLight(data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay);
                break;

            case 'HemisphereLight':
                object = new THREE.HemisphereLight(data.color, data.groundColor, data.intensity);
                break;

            case 'SkinnedMesh':
                console.warn('THREE.ObjectLoader.parseObject() does not support SkinnedMesh yet.');
            case 'Mesh':
                var geometry = getGeometry(data.geometry);
                var material = getMaterial(data.material);
                var rigidbody = getRigidbody(data.rigidbody);

                if (geometry.bones && geometry.bones.length > 0)
                    object = new THREE.SkinnedMesh(geometry, material);
                else {
                    if (rigidbody && rigidbody.colliders.length) {
                        object = new Physijs[rigidbody.colliders[0].type](geometry, material, rigidbody.mass);
                        object.rigidbody = rigidbody;
                    }
                    else
                        object = new THREE.Mesh(geometry, material);
                }
                break;

            case 'LOD':
                object = new THREE.LOD();
                break;

            case 'Line':
                object = new THREE.Line(getGeometry(data.geometry), getMaterial(data.material), data.mode);
                break;

            case 'LineLoop':
                object = new THREE.LineLoop(getGeometry(data.geometry), getMaterial(data.material));
                break;

            case 'LineSegments':
                object = new THREE.LineSegments(getGeometry(data.geometry), getMaterial(data.material));
                break;

            case 'PointCloud':
            case 'Points':
                object = new THREE.Points(getGeometry(data.geometry), getMaterial(data.material));
                break;

            case 'Sprite':
                object = new THREE.Sprite(getMaterial(data.material));
                break;

            case 'Group':
                object = new THREE.Group();
                break;

            default:
                object = new THREE.Object3D();
        }

        object.uuid = data.uuid;

        if (data.name !== undefined) object.name = data.name;
        if (data.matrix !== undefined) {
            matrix.fromArray(data.matrix);
            matrix.decompose(object.position, object.quaternion, object.scale);
        }
        else {
            if (data.position !== undefined) object.position.fromArray(data.position);
            if (data.rotation !== undefined) object.rotation.fromArray(data.rotation);
            if (data.quaternion !== undefined) object.quaternion.fromArray(data.quaternion);
            if (data.scale !== undefined) object.scale.fromArray(data.scale);
        }

        if (data.castShadow !== undefined) object.castShadow = data.castShadow;
        if (data.receiveShadow !== undefined) object.receiveShadow = data.receiveShadow;

        if (data.shadow) {
            if (data.shadow.bias !== undefined) object.shadow.bias = data.shadow.bias;
            if (data.shadow.radius !== undefined) object.shadow.radius = data.shadow.radius;
            if (data.shadow.mapSize !== undefined) object.shadow.mapSize.fromArray(data.shadow.mapSize);
            if (data.shadow.camera !== undefined) object.shadow.camera = this.parseObject(data.shadow.camera);
        }

        if (data.visible !== undefined) object.visible = data.visible;
        if (data.userData !== undefined) object.userData = data.userData;

        if (data.children !== undefined)
            for (var child in data.children)
                object.add(this.parseObject(data.children[child], geometries, materials, rigidbodies));

        if (data.type === 'LOD') {
            var levels = data.levels;

            for (var l = 0; l < levels.length; l++) {
                var level = levels[l];
                var child = object.getObjectByProperty('uuid', level.object);

                if (child !== undefined)
                    object.addLevel(child, level.distance);
            }
        }

        return (object);
    });
}();

THREE.ObjectLoader.prototype.parseRigidbodies = function (json) {
    let rigidbodies = {};

    if (json) {
        json.forEach((rigidbody) => {
            if (!rigidbody.uuid) return ;

            rigidbodies[rigidbody.uuid] = new Rigidbody(rigidbody);
        });
    }

    return (rigidbodies);
}
