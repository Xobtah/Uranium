/**
 * Created by xobtah on 01/09/17.
 */

let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let fs = require('fs-extra');
let path = require('path');

app.use(express.static(__dirname + '/public'));
app.use('/node_modules/', express.static(__dirname + '/node_modules/'));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(require('express-fileupload')());

app.post('/api/assets', (req, res) => {
    if (Object.keys(req.files).length) {
        let fileKey = Object.keys(req.files)[0];
        let file = req.files[fileKey];

        file.mv(path.join(__dirname, 'U235 Projects', fileKey), (err) => {
            if (err) {
                console.log(err);
                return (res.status(500).send(err));
            }
            res.sendStatus(200);
            io.sockets.emit('fileSystem', { type: 'POST', path: fileKey, isDir: false });
        });
    }
});

app.post('/api/assets/dir', (req, res) => {
    if (req.body.path)
        fs.mkdir(path.join(__dirname, 'U235 Projects', req.body.path), (err) => {
            if (err) {
                console.log(err);
                return (res.status(500).send(err));
            }
            res.sendStatus(200);
            io.sockets.emit('fileSystem', { type: 'POST', path: req.body.path, isDir: true });
        });
});

app.put('/api/assets', (req, res) => {
    if (req.body.path && req.body.new)
        fs.rename(path.join(__dirname, 'U235 Projects', req.body.path),
            path.join(__dirname, 'U235 Projects', req.body.new), (err) => {
                if (err) {
                    console.log(err);
                    return (res.status(500).send(err));
                }
                res.sendStatus(200);
                io.sockets.emit('fileSystem', { type: 'PUT', path: req.body.path, new: req.body.new });
        });
});

app.delete('/api/assets', (req, res) => {
    if (req.body.path)
        fs.remove(path.join(__dirname, 'U235 Projects', req.body.path), (err) => {
            if (err) {
                console.log(err);
                return (res.status(500).send(err));
            }
            res.sendStatus(200);
            io.sockets.emit('fileSystem', { type: 'DELETE', path: req.body.path });
        });
});

app.get('/api/assets', (req, res) => {
    if (req.query.path)
        fs.stat(__dirname + '/U235 Projects/' + req.query.path, (err, stats) => {
            if (err) {
                console.log(err);
                return (res.status(500).send(err));
            }

            if (stats.isFile())
                res.sendFile(path.join(__dirname, '/U235 Projects/', req.query.path));

            else if (stats.isDirectory())
                fs.readdir(__dirname + '/U235 Projects/' + req.query.path, (err, files) => {
                    let dirContent = [];

                    if (err) {
                        console.log(err);
                        return (res.status(500).send(err));
                    }

                    files.forEach((file) => {
                        let hasChildren = false;
                        let nodeIcon = 'jstree-file';

                        if (fs.statSync(__dirname + '/U235 Projects/' + req.query.path + '/' + file).isDirectory()) {
                            nodeIcon = 'jstree-folder';
                            if (fs.readdirSync(__dirname + '/U235 Projects/' + req.query.path + '/' + file).length)
                                hasChildren = true;
                        }

                        dirContent.push({
                            text: file,
                            id: req.query.path + '/' + file,
                            children: hasChildren,
                            icon: nodeIcon
                        });
                    });

                    if (dirContent.length === 1)
                        dirContent[0].state = { opened: true };

                    res.send(dirContent);
                });
        });
});

let server = app.listen(80);
let io = require('socket.io').listen(server);

io.on('connection', (client) => {
    console.log('Client connection.');

    client.on('disconnect', () => {});
});