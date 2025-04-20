import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Loader2, Zap } from "lucide-react";
import { insertUserSchema, loginUserSchema } from "@shared/schema";

const loginFormSchema = loginUserSchema;
type LoginFormValues = z.infer<typeof loginFormSchema>;

const registerFormSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      role: "operator",
    },
  });
  
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };
  
  const onRegisterSubmit = (values: RegisterFormValues) => {
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(userData);
  };
  
  // If user is already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Hero Section */}
      <div className="bg-primary text-white p-10 md:w-1/2 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-8">
            <div className="bg-white rounded p-2 mr-3">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">PowerPlant Ops</h1>
          </div>
          
          <h2 className="text-2xl font-semibold mb-4">
            Power Plant Operations Management System
          </h2>
          <p className="text-primary-foreground opacity-90 mb-6">
            A comprehensive platform for tracking events, defects, and signals 
            while maintaining detailed records of all operations.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="mt-1 bg-white/20 p-1 rounded mr-3">
                <i className="fas fa-check text-white"></i>
              </div>
              <div>
                <h3 className="font-medium">Event Tracking</h3>
                <p className="text-sm text-primary-foreground opacity-80">
                  Log and monitor operational events with detailed records and photo evidence.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 bg-white/20 p-1 rounded mr-3">
                <i className="fas fa-check text-white"></i>
              </div>
              <div>
                <h3 className="font-medium">Defect Management</h3>
                <p className="text-sm text-primary-foreground opacity-80">
                  Identify, document, and resolve plant defects with comprehensive tracking.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="mt-1 bg-white/20 p-1 rounded mr-3">
                <i className="fas fa-check text-white"></i>
              </div>
              <div>
                <h3 className="font-medium">Realtime Notifications</h3>
                <p className="text-sm text-primary-foreground opacity-80">
                  Stay informed with timely alerts about critical issues and updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Forms */}
      <div className="p-10 md:w-1/2 flex items-center justify-center bg-background">
        <div className="w-full max-w-md">
          <Tabs 
            defaultValue="login" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Login
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    variant="link" 
                    onClick={() => setActiveTab("register")}
                  >
                    Don't have an account? Register
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Register</CardTitle>
                  <CardDescription>
                    Create a new account to access the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Choose a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem className="hidden">
                            <FormControl>
                              <Input type="hidden" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Register
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button 
                    variant="link" 
                    onClick={() => setActiveTab("login")}
                  >
                    Already have an account? Login
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Demo Accounts:</p>
            <p className="text-xs">Admin: admin / admin123</p>
            <p className="text-xs">Operator: operator / operator123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
