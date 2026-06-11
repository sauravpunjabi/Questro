"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { Form } from "@/components/ui/form"
import Link from "next/link"
import { toast } from "sonner"
import FormField from "./FormField"
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/firebase/client"
import { signIn, signUp, } from "@/lib/actions/auth.action"

const authFormSchema = (type : FormType) => {
  return z.object({
    name: type === 'sign-up' ? z.string().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(3),

  })
}

const AuthForm = ({ type } : { type : FormType }) => {


  const formSchema = authFormSchema(type);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  // Submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
      try{
          if(type === 'sign-up'){

            const { name, email, password } = values;

            //Firebase provided function. This register a new user in firebase auth and not in database, 
            // using email and password if email is not already a user 
            const userCredentials = await createUserWithEmailAndPassword(auth, email, password);


            //to sign up the user
            const result = await signUp({
              uid: userCredentials.user.uid,
              name: name!,
              email,
              password,
            })

            if(!result?.success){
              toast.error(result?.message);
              return;
            }

            toast.success("Account created! Please sign in.");
            router.push("/sign-in");
          }
          else{

            const { email, password } = values;

            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            const idToken = await userCredential.user.getIdToken();

            if(!idToken){
              toast.error("Sign in failed")
              return;
            }

            await signIn({
              email, idToken
            })

            toast.success("Welcome back!")
            router.push('/')
          }
      }
      catch(error){
        console.log(error);
        toast.error(`There was an error: ${error}`);
      }
  }


  const isSignIn = type === 'sign-in';

  return (

    <div className="card-border lg:min-w-[566px]">

      <div className="flex flex-col gap-6 card py-14 px-10">

          <div className="flex flex-row gap-2 justify-center">
            <Image src="/logo.svg" alt="logo" height={32} width={32} />
            <h2 className="text-primary-100">Questro</h2>
          </div>

        <h3>Practice job interviews with the help of AI</h3>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6 mt-4 form">
            {!isSignIn && (
              <FormField 
                control = {form.control} 
                name= "name" 
                label = "Name" 
                placeholder = "Your name" />
             )}

            <FormField 
                control = {form.control} 
                name= "email" 
                label = "Email" 
                placeholder = "Your email" />
            
            <FormField 
                control = {form.control} 
                name= "password" 
                label = "Password" 
                placeholder = "Your password"
                type = 'password' />


            <Button className="btn" type="submit">{isSignIn ? 'Sign in' : 'Sign up' }</Button>
          </form>
        </Form>

        <p className="text-center">
          {isSignIn ? 'No account yet?' : 'Have an account already?'}
          
          <Link  href={!isSignIn ? '/sign-in' : '/sign-up'} className="font-bold text-user-primary ml-1"> 

          {!isSignIn ? 'Sign in' : 'Sign up'}

          </Link>
        </p>
    </div>   
  </div>
  )
}

export default AuthForm