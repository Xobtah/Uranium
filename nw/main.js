/**
 * Created by xobtah on 01/09/17.
 */

const nw = require('nw');
const path = require('path');

nw.Window.open(path.join(__dirname, '..', 'public', 'index.html'), {}, (win) => {});