import { Socket, Server } from "socket.io";

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
