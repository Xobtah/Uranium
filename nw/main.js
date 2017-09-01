/**
 * Created by xobtah on 01/09/17.
 */

const nw = require('nw');
const path = require('path');

console.log('test');
nw.Window.open(path.join(__dirname, '..', 'public', 'index.html'), {}, (win) => {});