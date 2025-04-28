import { Request, Response } from "express";
import { Room } from "../model/Room";

export const getRooms = async (request: Request, response: Response) => {
    try {
        const rooms = await Room.find();

        response.status(200).json({ rooms });
    } catch (error) {
        console.log(error);
        response.status(500).json(error);
    }
};