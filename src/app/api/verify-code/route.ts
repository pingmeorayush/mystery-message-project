import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";

export async function POST(request: Request){
    await dbConnect();

    try {
        const {username, code} = await request.json();
        username = decodeURIComponent(username);

        const user = await UserModel.findOne({username});
        if(!user){
            return Response.json({
                success: false,
                message: "User not found!"
            },{
                status: 500
            });        
        }
        const isCodeValid = code === user.verifyCode;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true;
            await user.save();
            return Response.json({
                success: true,
                message: "Account verified successfully."
            },{
                status: 200
            });    
        }

        if(!isCodeNotExpired){
            return Response.json({
                success: false,
                message: "Code has expired. Please signup again to get a new code."
            },{
                status: 400
            });  
        }

        if(!isCodeValid){
            return Response.json({
                success: false,
                message: "Incorrect verification code."
            },{
                status: 400
            });
        }
    } catch (error) {
        console.error("Error verifying user: ",error);
        return Response.json({
            success: false,
            message: "Error verifying user"
        },{
            status: 500
        });
    }
}