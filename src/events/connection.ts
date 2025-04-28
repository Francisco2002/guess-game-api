import { Socket } from "socket.io";
import { createUser, deleteUser } from "../actions/manageUser";

export const handleConnect = (socket: Socket) => {
    socket.on("login-user", async (username) => {
        const response = await createUser(username, socket.id);

        if(!response.success)
            socket.emit("error_transaction", { message: response.message });

        socket.emit("user-created", response.user);
    });
}

export const handleDisconnect = (socket: Socket) => {
    socket.on("disconnect", async () => {
        const response = await deleteUser(socket.id);

        if(!response.success)
            socket.emit("error_transaction", { message: response.message });
    });
}