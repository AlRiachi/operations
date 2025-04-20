import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationList } from "@/components/notifications/notification-list";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate saving settings
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
    }, 1000);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 md:ml-64">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <PageHeader 
            title="Settings" 
            subtitle="Manage your account and preferences"
          />
          
          <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="mb-6">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue={user?.firstName} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue={user?.lastName} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user?.username} />
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                    <Button onClick={handleSaveSettings} disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                    <Button variant="outline" className="mr-2">Cancel</Button>
                    <Button>Update Password</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Preferences</CardTitle>
                      <CardDescription>Configure how you receive notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="events" className="text-base">Events</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications about events
                          </p>
                        </div>
                        <Switch id="events" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="defects" className="text-base">Defects</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications about defects
                          </p>
                        </div>
                        <Switch id="defects" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="signals" className="text-base">Signals</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications about signal alerts
                          </p>
                        </div>
                        <Switch id="signals" defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="assignments" className="text-base">Assignments</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications when assigned to tasks
                          </p>
                        </div>
                        <Switch id="assignments" defaultChecked />
                      </div>
                      
                      <div className="pt-2 flex justify-end">
                        <Button onClick={handleSaveSettings} disabled={isSaving}>
                          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Save Preferences
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="lg:col-span-2">
                  <NotificationList />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and feel of the application</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border rounded-md p-3 flex flex-col items-center cursor-pointer bg-white shadow-sm">
                        <div className="w-full h-20 bg-white border rounded-md mb-2"></div>
                        <span className="text-sm">Light</span>
                      </div>
                      
                      <div className="border rounded-md p-3 flex flex-col items-center cursor-pointer">
                        <div className="w-full h-20 bg-gray-900 border rounded-md mb-2"></div>
                        <span className="text-sm">Dark</span>
                      </div>
                      
                      <div className="border rounded-md p-3 flex flex-col items-center cursor-pointer">
                        <div className="w-full h-20 bg-gradient-to-b from-white to-gray-900 border rounded-md mb-2"></div>
                        <span className="text-sm">System</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Accent Color</Label>
                    <div className="grid grid-cols-5 gap-4">
                      <div className="h-10 rounded-md bg-primary cursor-pointer border-2 border-primary"></div>
                      <div className="h-10 rounded-md bg-secondary cursor-pointer"></div>
                      <div className="h-10 rounded-md bg-accent cursor-pointer"></div>
                      <div className="h-10 rounded-md bg-destructive cursor-pointer"></div>
                      <div className="h-10 rounded-md bg-slate-500 cursor-pointer"></div>
                    </div>
                  </div>
                  
                  <div className="pt-2 flex justify-end">
                    <Button onClick={handleSaveSettings} disabled={isSaving}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Appearance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
