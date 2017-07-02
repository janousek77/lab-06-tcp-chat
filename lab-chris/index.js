'use strict';

const net = require('net');
const server = net.createServer();

let clientPool = [];

let dm = (user, msg) => {
  let dmMsg = clientPool.indexOf(user);
  dmMsg.write(`${user}: ${msg}`);
};

let troll = (msg, num) => {
  for(let i = 0; i < num; i++) {
    clientPool.forEach(socket => socket.write(`${msg}\n`));
  }
};

server.on('connection', (socket) => {
  socket.write('Welcome to the chat!\n');
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

    if(data.startsWith('/dm')) {
      dm(data.split('/dm')[1].trim());
      return;
    }

    if(data.startsWith('/troll')) {
      troll(data.split('/troll')[1].trim(), 5);
      return;
    }

    clientPool.forEach((item) => {
      item.write(`${socket.nickname}: ${data}`);
    });
  });
});

server.listen(3000, () => {
  console.log('server up on port 3000');
});
