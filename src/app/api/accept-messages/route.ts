import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { User } from "next-auth";

export async function POST(request: Request){
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

    const userId = user?._id;

    const {acceptMessages} = await request.json();
     
    try {
        const updatedUser = await UserModel.findByIdAndUpdate(userId,{
            isAcceptingMessage: acceptMessages
        },{
            new: true
        });

        if(!updatedUser){
            return Response.json({
                success: false,
                message: "Failed to update user status to accept messages."
            },{
                status: 401
            });
        }

        return Response.json({
            success: true,
            message: "User Updated successfully.",
            user: updatedUser
        },{
            status: 200
        });

    } catch (error) {
        console.log("Failed to update user status to accept messages.",error);

        return Response.json({
            success: false,
            message: "Failed to update user status to accept messages."
        },{
            status: 500
        })
    }
}

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

    const userId = user?._id;

    try {
            const foundUser = await UserModel.findById(userId);

        if(!foundUser){
            return Response.json({
                success: false,
                message: "Failed to update user status to accept messages."
            },{
                status: 401
            });
        }

        return Response.json({
            success: true,
            message: "User Updated successfully.",
            isAcceptingMessage: foundUser?.isAcceptingMessage
        },{
            status: 200
        });

    } catch (error) {
        console.log("Failed to update user status to accept messages.",error);
        return Response.json({
                success: false,
                message: "Failed to update user status to accept messages."
            },{
                status: 500
            })
    }
       
}
