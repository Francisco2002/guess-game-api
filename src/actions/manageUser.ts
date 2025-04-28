import { User } from "../model/User";

export const createUser = async (username: string, socket_id: string) => {
    try {
        const user = await User.create({ username, socket_id });

        return {success: true, message: "User created", user};
    } catch (error) {
       console.log("Error > ", error); 
       return {success: false, message: JSON.stringify(error)};
    }
}

export const deleteUser = async (socket_id: string) => {
    try {
        await User.deleteOne({ socket_id });

        return {success: true, message: "User deleted"};
    } catch (error) {
        console.log("Error > ", error);
        return {success: false, message: JSON.stringify(error)};
    }
}
