const socket_io = require('socket.io');
const io = socket_io();
const socketAPI = {};
//Your socket logic here
socketAPI.io = io;
module.exports = socketAPI;