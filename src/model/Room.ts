import { model, Schema } from "mongoose";

const roomSchema = new Schema({
    room_id: String,
    name: String,
    theme: String,
    members: Number,
    owner_id: String
});

const Room = model("Room", roomSchema);

export { Room };