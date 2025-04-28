import { model, Schema } from "mongoose";

const userSchema = new Schema({
    username: String,
    socket_id: String
});

const User = model("User", userSchema);

export { User };