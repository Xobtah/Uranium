let express = require('express');
let app = express();

app.use(express.static('.'));

app.get('/physijs_worker.js', (req, res) => {
    res.sendFile(__dirname + '/js/libs/Physijs/physijs_worker.js');
});

app.get('/ammo.js', (req, res) => {
    res.sendFile(__dirname + '/js/libs/Physijs/examples/js/ammo.js');
});

app.listen(23592);
