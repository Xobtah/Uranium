/**
 * Created by xobtah on 01/09/17.
 */

let express = require('express');
let app = express();

app.use(express.static(__dirname + '/public'));
app.use('/node_modules/', express.static(__dirname + '/node_modules/'));

app.listen(235);