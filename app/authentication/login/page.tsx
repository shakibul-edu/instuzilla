"use client";
import { z } from "zod";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { loginFormSchema } from "@/utils/formSchema";
import AuthContext from "@/app/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import Spinner from "@/components/ui/spinner";

export default function Page() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  // Getting authentication context
  const { signIn, user, error, loading } = useContext(AuthContext);
  // Checking the state of user
  const router = useRouter();
  useEffect(() => {
    if (user) {
      return router.push(redirectUrl);
    }
  }, [user]);

  // Creating form resolver using zodResolver
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      instu_id: "",
      username: "",
      password: "",
    },
  });

  // Define a submit handler.
  function onSubmit(values: z.infer<typeof loginFormSchema>) {
    signIn(values);
  }

  useEffect(() => {
    if (error?.length > 0) {
      toast({
        variant: "destructive",
        title: "Heads Up!",
        description: error,
      });
    }
  }, [error, user]);

  return (
    <>
      <div className="max-w-md w-full p-4 items-center border border-indigo-500 bg-slate-50 rounded-sm shadow-xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <h3 className="text-lg font-semibold text-center sm:text-xl">Login</h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Institute ID Field */}
            <FormField
              control={form.control}
              name="instu_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 sm:text-base">
                    Institute ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Institute ID"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Username Field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 sm:text-base">
                    Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Username"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-sm font-medium text-gray-700 sm:text-base">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter Password"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button className="w-full flex justify-center">
              {loading && <Spinner />}
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
}
