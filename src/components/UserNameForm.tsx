"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation } from "@apollo/client";
import { UpdateUsersUsernameDocument } from "@/graphql/generated/gql.types";

import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { UsernameValidator } from "@/lib/validators/username";

interface UserNameFormProps extends React.HTMLAttributes<HTMLFormElement> {
  user: {
    id: string;
    username: string;
  };
}

type FormData = z.infer<typeof UsernameValidator>;

export function UserNameForm({ user, className, ...props }: UserNameFormProps) {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      name: user?.username || "",
    },
  });

  const [mutation, mutation_result] = useMutation(UpdateUsersUsernameDocument, {
    onError: (err) => {
      console.log(err);
    },
    onCompleted: (data) => {
      const id = data.update_users?.returning[0].id;
      if (id) {
        toast({
          description: "Your username has been updated.",
        });
      }
    },
  });

  const click_submit = async (data: FormData): Promise<void> => {
    console.log("click_submit");
    await mutation({
      variables: {
        user_id: user.id,
        username: data.name,
      },
    });
  };

  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit((e) => click_submit(e))}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>
          <CardDescription>
            Please enter a display name you are comfortable with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative grid gap-1">
            <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm text-zinc-400">u/</span>
            </div>
            <Label className="sr-only" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              className="w-[400px] pl-6"
              size={32}
              {...register("name")}
            />
            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button>Change name</Button>
        </CardFooter>
      </Card>
    </form>
  );
}
