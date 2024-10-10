import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function GET(){
    dbConnect();
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if(!session || !session.user){
        return Response.json({
            success: false,
            message: "Not authenticated"
        },{
            status: 401
        });
    }

    const userId = new mongoose.Types.ObjectId(user?._id); 
     
    try {
        const userData = await UserModel.aggregate([
            { $match : {$id: userId}},
            { $unwind: '$messages'},
            { $sort: {'message.createdAt': -1}},
            { $group: {_id: '$_id', messages: {$push: '$messages'}}}
        ]);

        if(!userData || userData.length === 0){
            return Response.json({
                success: false,
                message: "User not found"
            },{
                status: 401
            });
        }

        return Response.json({
            success: true,
            message: "Messages",
            messages: userData[0].messages
        },{
            status: 200
        });

    } catch (error) {
        console.log("Failed to get the messages data",error);

        return Response.json({
            success: false,
            message: "Failed to get the messages data"
        },{
            status: 500
        })
    }
}