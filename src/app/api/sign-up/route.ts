import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import bcrypt from 'bcryptjs';

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){
    await dbConnect();

    try {
        const {username, email, password} = await request.json();
        const exisitngUserVerifiedByUsername = await UserModel.findOne({
            username, 
            isVerified: true
        });
        if(exisitngUserVerifiedByUsername){
            return Response.json({
                success: false,
                message: 'Username is already taken' 
            },
            {
                status: 400
            });
        }
        const exisitngUserByEmail = await UserModel.findOne({email});
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedPassword = await bcrypt.hash(password,10);
        const verifyCodeExpiry = new Date()
            verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1);
        if(exisitngUserByEmail){
            if(exisitngUserByEmail.isVerified){
               return Response.json({
                success: false,
                message: 'Username is already taken' 
                },
                {
                    status: 400
                }); 
            }else{
                exisitngUserByEmail.verifyCode = verifyCode;
                exisitngUserByEmail.password = hashedPassword;
                exisitngUserByEmail.verifyCodeExpiry = verifyCodeExpiry;
                exisitngUserByEmail.save();
            }
        }else{
            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: verifyCodeExpiry,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            });
            await newUser.save();
        }
        // send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);

        if(!emailResponse.success){
            return Response.json({
                success: false,
                message: emailResponse.message
            },{
                status: 500
            })
        }

        return Response.json({
                success: true,
                message: "User registered successfully. Please verify your email."
            },{
                status: 200
        })

    } catch (error) {
        console.error("Error registering user",error);
        return Response.json(
            {
                success: false,
                message: "Error registering user"
            },
            {
                status: 500
            }
        );
    }
}