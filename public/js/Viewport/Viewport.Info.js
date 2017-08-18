/**
 * @author mrdoob / http://mrdoob.com/
 */

Viewport.Info = function (editor, dom) {
	let signals = editor.signals;

	let container = { dom: dom };
	container.dom.id = 'info';
	container.dom.style.position = 'absolute';
	container.dom.style.left = '10px';
	container.dom.style.bottom = '10px';
	container.dom.style.fontSize = '12px';
	container.dom.style.color = '#fff';

	let objectsText = new UI.Text('0').setMarginLeft('6px');
	let verticesText = new UI.Text('0').setMarginLeft('6px');
	let trianglesText = new UI.Text('0').setMarginLeft('6px');

	container.dom.append((new UI.Text('objects')).dom, objectsText.dom, (new UI.Break()).dom);
	container.dom.append((new UI.Text('vertices')).dom, verticesText.dom, (new UI.Break()).dom);
	container.dom.append((new UI.Text('triangles')).dom, trianglesText.dom, (new UI.Break()).dom);

	signals.objectAdded.add(update);
	signals.objectRemoved.add(update);
	signals.geometryChanged.add(update);

	//

	function update() {
		let scene = editor.scene;

		let objects = 0, vertices = 0, triangles = 0;

		for (let i = 0, l = scene.children.length; i < l; i++) {
			let object = scene.children[i];

			object.traverseVisible(function (object) {
				objects++;
				if (object instanceof THREE.Mesh) {
					let geometry = object.geometry;

					if (geometry instanceof THREE.Geometry) {
						vertices += geometry.vertices.length;
						triangles += geometry.faces.length;
					}
					else if (geometry instanceof THREE.BufferGeometry) {
						if (geometry.index !== null) {
							vertices += geometry.index.count * 3;
							triangles += geometry.index.count;
						}
						else {
							vertices += geometry.attributes.position.count;
							triangles += geometry.attributes.position.count / 3;
						}
					}
				}
			} );

		}

		objectsText.setValue(objects.format());
		verticesText.setValue(vertices.format());
		trianglesText.setValue(triangles.format());
	}

	return (container);
};
