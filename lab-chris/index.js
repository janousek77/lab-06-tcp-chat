'use strict';

const net = require('net');
const server = net.createServer();

let clientPool = [];
let curUser = 1;

let dmRecipient;
function findRecipient(clientPool) {
  return clientPool.nickname === dmRecipient;
}

server.on('connection', (socket) =>{
  console.log('socket connected.\n');
  socket.write('Welcome to the chat.\n');


  socket.nickname = `Guest${curUser}`;
  curUser++;
  clientPool = [...clientPool, socket];
  socket.write(`You\'re connected as ${socket.nickname}\n`);


  let handleDisconnect = () => {
    console.log(`${socket.nickname} has disconnected\n`);
    clientPool = clientPool.filter(item => item !== socket);
  };

  socket.on('error', handleDisconnect);
  socket.on('close', handleDisconnect);

  socket.on('data', (buffer) => {
    let data = buffer.toString();
    let content = buffer.toString();

    let print = (users, content) => {
      users.forEach((user) => {
        user.write(`${socket.nickname}: ${content.toString()}`);
      });
    };

    if (data.startsWith('/nick')){
      socket.nickname = data.split('/nick')[1] || socket.nickname;
      socket.nickname = socket.nickname.trim();
      socket.write(`you are now ${socket.nickname}\n`);
      return;
    }


    if (data.startsWith('/dm')){
      let wholeMsg = data.split('/dm ')[1] || '';
      dmRecipient = wholeMsg.split(/\s+/)[0];
      let content = wholeMsg.replace(dmRecipient, '');
      print([clientPool.find(findRecipient)], (`**DM** => ${content}`));
      return;
    }

    if (data.startsWith('/troll')){
      let wholeMsg = data.split('/troll ')[1] || '';
      let trollNum = wholeMsg.split(/\s+/)[0];
      let content = wholeMsg.replace(trollNum, '');
      for(let i = 0; i < trollNum; i++){
        print(clientPool, content);
      }
      return;
    }

    if (data.startsWith('/quit')){
      socket.end();
      let index = clientPool.indexOf(socket);
      clientPool.splice(index,1);
      return;
    }

    else{
      print(clientPool, content);
    }
  });
});

server.listen(3000, () => {
  console.log('server up on port 3000');
});
