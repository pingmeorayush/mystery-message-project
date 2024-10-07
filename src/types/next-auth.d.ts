import 'next-auth';
import { DefaultSession } from 'next-auth';
// this file user to add fields to the user object then is being captured in the callbacks data
declare module "next-auth" {
    interface User{
        _id?:string;
        isVerified?:boolean;
        isAcceptingMessages?:boolean;
        username?:string;
    }
    interface Session{
        user:{
            _id?: string;
            isVerified?:boolean;
            isAcceptingMessages?:boolean;
            username?:string;
        } & DefaultSession['user']
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        _id?: string;
        isVerified?:boolean;
        isAcceptingMessages?:boolean;
        username?:string;
    }
}