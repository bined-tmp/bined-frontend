"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import * as React from "react";
import { FC } from "react";
import { buttonVariants } from "@/components/ui/Button";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "./Icons";
import { LoginValidator } from "@/lib/validators/auth";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface UserLoginFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const UserLoginForm: FC<UserLoginFormProps> = ({ className, ...props }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  type FormData = z.infer<typeof LoginValidator>;

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(LoginValidator),
  });

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");
      await signInWithPopup(auth, provider);
      await signIn("google");
      toast({
        description: "Login successful with Google!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error logging in with Google",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const click_submit = async (data: FormData): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: true,
        callbackUrl: "/dashboard",
      });
      toast({
        description: "Login successful!",
      });
    } catch (error) {
      console.error("error", error);
      toast({
        title: "Error",
        description: "There was an error",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <Link
        href="/register"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 top-4 md:right-8 md:top-8"
        )}
      >
        Register
      </Link>
      <form onSubmit={handleSubmit((e) => click_submit(e))}>
        <div className="grid gap-2">
          <div className="grid gap-1 mb-2">
            <div>
              <Label className="mb-2" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                placeholder="test@example.com"
                className="mb-1"
                {...register("email")}
              />
              {errors?.email && (
                <p className="px-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-2" htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                className="mb-1"
                {...register("password")}
              />
              {errors?.password && (
                <p className="px-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
          <button className={cn(buttonVariants())} disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Login
          </button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }))}
        onClick={loginWithGoogle}
        disabled={isLoading}
      >
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="h-4 w-4 mr-2" />
        )}
        Google
      </button>
    </div>
  );
};

export default UserLoginForm;
