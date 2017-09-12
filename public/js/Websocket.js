/**
 * Created by xobtah on 07/09/17.
 */

let socket = io();

socket.on('connect', () => console.log('Websocket connected.'));

//socket.on('disconnect', () => {});