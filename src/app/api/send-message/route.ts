import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { Message } from "@/model/user.model";

export async function POST(request: Request){
    dbConnect();
    const {username, content} = await  request.json();
     
    try {
        const user = await UserModel.findOne(username);

        if(!user){
            return Response.json({
                success: false,
                message: "User not found"
            },{
                status: 401
            });    
        }

        if(!user.isAcceptingMessage){
            return Response.json({
                success: false,
                message: "User is not accepting messages right now."
            },{
                status: 403
            });    
        }

        const newMessage = {content, createdAt: new Date()};
        
        user.messages.push(newMessage as Message);
        
        await user.save();

        return Response.json({
            success: true,
            message: "Message sent successfully.",
        },{
            status: 200
        });

    } catch (error) {
        console.log("Failed to send the message",error);

        return Response.json({
            success: false,
            message: "Failed to send the message"
        },{
            status: 500
        })
    }
}