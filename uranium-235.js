/**
 * Created by xobtah on 01/09/17.
 */

let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let fs = require('fs');

app.use(express.static(__dirname + '/public'));
app.use('/node_modules/', express.static(__dirname + '/node_modules/'));

app.use(bodyParser.json());

app.post('/state', (req, res) => {
    fs.writeFile('Assets/Scenes/' + req.body.name + '.json', JSON.stringify(req.body.data));
    res.sendStatus(200);
});

app.get('/assets', (req, res) => {
    let dirContent = [];

    if (req.query.id === '#')
        return (res.send({ text: 'Assets', id: 'Assets', children: true, state: { opened: true } }));

    fs.readdir(__dirname + '/' + req.query.id, (err, files) => {
        if (err) {
            console.log(err);
            return (res.sendStatus(400));
        }

        files.forEach((file) => {
            let hasChildren = false;

            if (fs.statSync(__dirname + '/' + req.query.id + '/' + file).isDirectory() &&
                fs.readdirSync(__dirname + '/' + req.query.id + '/' + file).length)
                hasChildren = true;

            dirContent.push({
                text: file,
                id: req.query.id + '/' + file,
                children: hasChildren
            });
        });

        res.send(dirContent);
    });
});

app.listen(80);