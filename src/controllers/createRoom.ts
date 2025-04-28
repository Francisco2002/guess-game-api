import { Request, Response } from "express";
import { Room } from "../model/Room";
import { v4 as uuidv4 } from 'uuid';

export const createRoom = async (request: Request, response: Response) => {
    try {
        const { name, theme, members, owner_id } = request.body;
        const room_id = uuidv4(); 

        const room = await Room.create({ name, theme, members, owner_id, room_id });

        response.status(201).json({ room });
    } catch (error) {
        console.log(error);
        response.status(500).json(error);
    }
}