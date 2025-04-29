import { Socket, Server } from "socket.io";
import { User } from "../model/User";
import { PlayerScore, RoomGameData } from "../types";
import { sanitizeStr } from "../utils/string";

const roomData: Record<string, RoomGameData> = {};
const scoreboard: Record<string, PlayerScore> = {};
let turns = 0;

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

const endGame = (room: string, io: Server) => {
    const score: Record<string, number> = {};

    for (const s_id in scoreboard) {
        const player_data = scoreboard[s_id];

        score[player_data.username] = player_data.score;
    }
    
    io.to(room).emit("end-game", score);
}

const selectAndNotifyNextPlayer = async (room: string, io: Server) => {
    let current = roomData[room].current;
    let players = roomData[room].players;

    const socket_id = players[current];

    const user = await User.findOne({ socket_id }).exec();

    current++;

    if(current === players.length) {
        current = 0;
        turns += 1
    }

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
            secret: ""
        };

        socketsIds.forEach(async s_id => {
            const user = await User.findOne({ socket_id: s_id }).exec();

            scoreboard[s_id] = {
                username: user?.username ?? "",
                score: 0,
            }; 
        });

        selectAndNotifyNextPlayer(room, io);
    })
}

export const nextTurnPlayer = (socket: Socket, io: Server) => {
    socket.on("end-turn", (room: string) => {
        const gameNextAction = turns === 5 ? endGame : selectAndNotifyNextPlayer;
        gameNextAction(room, io);
    })
}

export const defineRoomSecret = (socket: Socket) => {
    socket.on("define-secret", (room: string, secret: string) => {
        roomData[room].secret = sanitizeStr(secret);

        socket.to(room).emit("secret-defined", secret);
    });
}

export const makeGuess = (socket: Socket) => {
    socket.on("make-guess", (room: string, guess: string) => {
        const secret = roomData[room].secret;

        if(secret === sanitizeStr(guess)) {
            scoreboard[socket.id].score += 1;
            socket.emit("correct-response");
        } else {
            socket.emit("wrong-response");
        }
    });
}