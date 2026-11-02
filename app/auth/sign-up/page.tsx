"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldError } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import * as z from "zod";
import { signUpSchema } from "@/app/schemas/auth";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  function onSubmit(data: z.infer<typeof signUpSchema>) {
    // Using startTransition so the form doesn't freeze while the network request runs
    startTransition(async () => {
      try {
        const { error } = await authClient.signUp.email({
          name: data.name,
          email: data.email,
          password: data.password,
        });

        if (error) {
          throw new Error(error.message);
        }

        toast.add({ type: "success", description: "Account created!" });
        router.push("/dashboard");
      } catch (err) {
        toast.add({
          type: "error",
          description: err instanceof Error ? err.message : "Failed to sign up",
          priority: "high",
        });
      }
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Sign up to create a new account if you don&apos;t have one
        </CardDescription>
        <CardAction>
          <Link
            href="/auth/login"
            className={buttonVariants({ variant: "link" })}
          >
            Login
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    {...field} // 👈 This connects the input to RHF
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    placeholder="m@example.com"
                    {...field}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    placeholder="********"
                    {...field}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
