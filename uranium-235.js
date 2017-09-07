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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/assets', (req, res) => {
    let fileContent = req.body.data ? JSON.stringify(req.body.data) : '';

    fs.writeFile(path.join(__dirname, 'U235 Projects', req.body.path), fileContent, (err) => {
        return (err ? res.status(500).send(err) : res.sendStatus(200));
    });
});

app.put('/api/assets', (req, res) => {
    if (req.body.path && req.body.new)
        fs.move(path.join(__dirname, 'U235 Projects', req.body.path),
            path.join(__dirname, 'U235 Projects', req.body.new), (err) => {
                if (err) {
                    console.log(err);
                    return (res.status(500).send(err));
                }
                res.sendStatus(200);
        });
});

app.delete('/api/assets', (req, res) => {
    fs.remove(path.join(__dirname, 'U235 Projects', req.body.path), (err) => {
        if (err) {
            console.log(err);
            return (res.status(500).send(err));
        }
        res.sendStatus(200);
    });
});

app.get('/api/assets', (req, res) => {
    fs.stat(__dirname + '/U235 Projects/' + req.query.path, (err, stats) => {
        if (err) {
            console.log(err);
            return (res.status(500).send(err));
        }

        if (stats.isFile())
            fs.readFile(__dirname + '/U235 Projects/' + req.query.path, (err, data) => {
                if (err) {
                    console.log(err);
                    return (res.status(500).send(err));
                }
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.parse(data));
            });

        else if (stats.isDirectory())
            fs.readdir(__dirname + '/U235 Projects/' + req.query.path, (err, files) => {
                let dirContent = [];

                if (err) {
                    console.log(err);
                    return (res.status(500).send(err));
                }

                files.forEach((file) => {
                    let hasChildren = false;

                    if (fs.statSync(__dirname + '/U235 Projects/' + req.query.path + '/' + file).isDirectory() &&
                        fs.readdirSync(__dirname + '/U235 Projects/' + req.query.path + '/' + file).length)
                        hasChildren = true;

                    dirContent.push({
                        text: file,
                        id: req.query.path + '/' + file,
                        children: hasChildren
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

    client.on('fileSystemChanged', () => client.broadcast.emit('fileSystemChanged'));

    client.on('disconnect', () => {});
});