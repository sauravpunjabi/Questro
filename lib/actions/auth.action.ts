'use server';

import { db, auth } from "@/firebase/admin";
import { cookies } from "next/headers";

const One_Day = 60 * 60 * 24;

export async function signUp(params: SignUpParams){
    const { uid, name, email } = params;

    try{

        //Fetching users by heading into users collection and getting a doc with specific ID
        const userRecord = await db.collection('users').doc(uid).get();

        if(userRecord.exists){
            return{
                success: false,
                message: 'User already exists, please sign-in instead.'
            }
        }

        await db.collection('users').doc(uid).set({
            name, email
        })

        return{
            success: true,
            message: "You have successfully created an account. Please sign in"
        }


    }catch(e : any){
        console.error(`Error creating a user`, e);

        if(e.code === 'auth/email-already-exists'){
            return{
                success: false,
                message: 'Email already in use.'
            }
        }

        return{
            success: false,
            message: 'Failed to create an account.'
        }
    }
}

export async function signIn(params: SignInParams){
    const { email, idToken } = params;

    try{

        const userRecord = await auth.getUserByEmail(email);

        if(!userRecord){
            return{
                success:false,
                message: 'User does not exist. Create an account.'
            }
        }

        await setSessionCookie(idToken);

    }catch(e)
    {
        console.log(e);
        return{
            success: false,
            message: 'Failed to log into the account.'
        }
    }
}

export async function setSessionCookie(idToken : string){
    const cookiesStore = await cookies();


    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: One_Day * 1000,
    })

    cookiesStore.set('session', sessionCookie, {
        maxAge: One_Day,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',

        //sameSite: 'lax'
        //Controls cross-site cookie sending:
        //'lax': Cookie is sent with top-level navigation (safe default).
        //'strict': Cookie not sent cross-site at all.
        //'none': Cookie sent in all contexts but must also have secure: true.
        sameSite: 'lax'
    })
}

export async function getCurrentUser(): Promise<User | null>{
    const cookieStore = await cookies();

    const sessionCookie = cookieStore.get('session')?.value;

    if(!sessionCookie) return null;


     try{
            
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

        const userRecord = await db.collection('users').doc(decodedClaims.uid).get();

        if(!userRecord.exists) return null;
        
        return {
            ...userRecord.data(),
            id: userRecord.id,
        } as User

     }catch(e){
        console.log(e);

        return null;
     }
}

export async function isAuthenticated(){
    const user = await getCurrentUser();

    //to get boolean values
    return !!user;
    
}