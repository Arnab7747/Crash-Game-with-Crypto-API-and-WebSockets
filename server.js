const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const gameSocket = require('./sockets/gameSocket');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

gameSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
