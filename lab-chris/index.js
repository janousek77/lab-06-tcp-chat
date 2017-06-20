'use strict';

const net = require('net');
const server = net.createServer();

let clientPool = [];

server.on('connection', (socket) => {
  socket.write('hello socket, welcome to slugchat!\n');
  socket.nickname = `guest_${Math.random()}`;
  console.log(`${socket.nickname} connected!`);

  clientPool = [...clientPool, socket];

  let handleDisconnect = () => {
    console.log(`${socket.nickname} left the chat`);
    clientPool = clientPool.filter(item => item !== socket);
  };

  socket.on('error', handleDisconnect);
  socket.on('close', handleDisconnect);

  socket.on('data', (buffer) => {
    let data = buffer.toString();
    if(data.startsWith('/nickname')){
      socket.nickname = data.split('/nickname ')[1] || socket.nickname;
      socket.nickname = socket.nickname.trim();
      socket.write(`you are now know as ${socket.nickname}`);
      return;
    }

    // "/dm slugbyte how are you"
    // if(data.startsWith('/dm')){
    //   let content = data.split('/dm')[1] || '';
      // 'slugbyte how are you'
    // }

    clientPool.forEach((item) => {
      item.write(`${socket.nickname}: ${data}`);
    });
  });
});

server.listen(3000, () => {
  console.log('server up on port 3000');
});
