import express, { json, urlencoded } from 'express';
import { createServer } from "http";
import { connect } from 'mongoose';
import { Server } from "socket.io";
import cors from "cors";
import { getRooms } from './controllers/getRooms';
import { createRoom } from './controllers/createRoom';
import { handleConnect, handleDisconnect } from './events/connection';
import { joinRoom } from './events/room';
import { sendMessage } from './events/game';

const app = express();
app.use(json());
app.use(urlencoded({ extended: true }));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}))

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  }
});

io.on("connection", socket => {
  handleConnect(socket);
  handleDisconnect(socket);
  joinRoom(socket, io);
  sendMessage(socket, io);

  socket.emit("connected");
});

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/guessgame";

connect(mongoUrl).then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" })
});

app.get("/room", getRooms);
app.post("/room", createRoom);

httpServer.listen(3000, () => console.log('API rodando na porta 3000'));
