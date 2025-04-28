import { Server, Socket } from "socket.io";
import { Room } from "../model/Room";

export const joinRoom = (socket: Socket, io: Server) => {
    socket.on("join-room", async (room_id, user) => {
        const room = await Room.findOne({ room_id }).exec();
        const connectedSockets = await io.in(room_id).fetchSockets();

        if (room) {
            const members = room.members ?? 10;

            if (connectedSockets.length < members) {
                socket.join(room_id);
                socket.to(room_id).emit("new-player", { username: user.username });
            } else {
                socket.emit("full-room");
            }
        }
    })
};
