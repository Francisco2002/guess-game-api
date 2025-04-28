import { Socket, Server } from "socket.io";
import { User } from "../model/User";
import { RoomGameData } from "../types";

const roomData: Record<string, RoomGameData> = {};

export const sendMessage = (socket: Socket, io: Server) => {
    socket.on("send-message", async (room, username, message) => {
        const connectedSockets = await io.in(room).fetchSockets();

        const socketsIds = connectedSockets.map(s => s.id);

        if (socketsIds.includes(socket.id)) {
            const messageObj = {
                text: message,
                username
            }
            socket.to(room).emit("receive-message", messageObj);
        }
    });
};

const selectAndNotifyNextPlayer = async (room: string, io: Server) => {
    let current = roomData[room].current;
    let players = roomData[room].players;

    const socket_id = players[current];

    const user = await User.findOne({ socket_id }).exec();

    current++;

    if(current === players.length)
        current = 0;

    roomData[room].current = current;

    io.to(socket_id).emit("your-turn");
    io.to(room).except(socket_id).emit("new-turn", user);
}

export const startGame = (socket: Socket, io: Server) => {
    socket.on("start-game", async (room: string) => {
        const connectedSockets = await io.in(room).fetchSockets();
        const socketsIds = connectedSockets.map(s => s.id);
        
        roomData[room] = {
            players: socketsIds,
            current: 0,
        };

        selectAndNotifyNextPlayer(room, io);
    })
}

export const nextTurnPlayer = (socket: Socket, io: Server) => {
    socket.on("end-turn", (room: string) => {
        selectAndNotifyNextPlayer(room, io);
    })
}
