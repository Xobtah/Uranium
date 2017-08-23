/**
 * @author mrdoob / http://mrdoob.com/
 */

let Storage = function () {
	let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

	if (indexedDB === undefined ) {
		console.warn('Storage: IndexedDB not available.');
		return ({ init: function () {}, get: function () {}, set: function () {}, clear: function () {} });
	}

	let name = 'threejs-editor';
	let version = 1;

	let database;

	return ({
		init: function (callback) {
			let request = indexedDB.open(name, version);

			request.onupgradeneeded = function (event) {
				let db = event.target.result;

				if (db.objectStoreNames.contains('states') === false)
					db.createObjectStore('states');
			};
			request.onsuccess = function (event) {
				database = event.target.result;
				callback();
			};
			request.onerror = function (event) {
				console.error('IndexedDB', event);
			};
		},

		get: function (callback) {
			let transaction = database.transaction([ 'states' ], 'readwrite');
			let objectStore = transaction.objectStore('states');
			let request = objectStore.get(0);
			request.onsuccess = function (event) {
				callback(event.target.result);
			};
		},

		set: function (data, callback) {
			let start = performance.now();

			let transaction = database.transaction([ 'states' ], 'readwrite');
			let objectStore = transaction.objectStore('states');
			let request = objectStore.put(data, 0);
			request.onsuccess = function (event) {
				console.log('[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']', 'Saved state to IndexedDB. ' + (performance.now() - start).toFixed(2) + 'ms');
			};
		},

		clear: function () {
			if (database === undefined)
				return ;

			let transaction = database.transaction([ 'states' ], 'readwrite');
			let objectStore = transaction.objectStore('states');
			let request = objectStore.clear();
			request.onsuccess = function (event) {
				console.log('[' + /\d\d\:\d\d\:\d\d/.exec( new Date() )[ 0 ] + ']', 'Cleared IndexedDB.');
			};
		}
	});
};
