import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Signal } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignalList } from "@/components/signals/signal-list";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function SignalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch signals
  const { data: signals = [] } = useQuery<Signal[]>({
    queryKey: ["/api/signals"],
  });
  
  // Separate forced signals from other signals
  const forcedSignals = signals.filter(s => 
    s.name.startsWith("forced_") || s.source.includes("forced"));
    
  const regularSignals = signals.filter(s => 
    !s.name.startsWith("forced_") && !s.source.includes("forced"));
  
  // Prepare chart data for regular signals
  const regularChartData = regularSignals.slice(0, 10).map(signal => ({
    name: signal.name,
    value: parseFloat(signal.value),
    unit: signal.unit,
    time: new Date(signal.createdAt).toLocaleTimeString(),
  }));
  
  // Prepare chart data for forced signals
  const forcedChartData = forcedSignals.slice(0, 10).map(signal => ({
    name: signal.name.startsWith("forced_") ? signal.name.replace("forced_", "") : signal.name,
    value: parseFloat(signal.value),
    unit: signal.unit,
    time: new Date(signal.createdAt).toLocaleTimeString(),
  }));
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 md:ml-64">
        <Header onSearch={handleSearch} />
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <Tabs defaultValue="forced" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="forced">Forced Signals</TabsTrigger>
              <TabsTrigger value="regular">System Signals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="forced" className="space-y-6">
              <div className="grid gap-6 mb-8">
                {forcedSignals.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Forced Signals</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={forcedChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#FF5630" 
                            strokeWidth={2}
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
                
                <SignalList />
              </div>
            </TabsContent>
            
            <TabsContent value="regular" className="space-y-6">
              <div className="grid gap-6 mb-8">
                {regularSignals.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>System Signals</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={regularChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#0052CC" 
                            strokeWidth={2}
                            activeDot={{ r: 8 }} 
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
                
                {regularSignals.length === 0 && (
                  <Card>
                    <CardContent className="flex items-center justify-center h-40 text-center">
                      <div className="text-muted-foreground">
                        <p className="mb-2">No system signals available</p>
                        <p className="text-sm">The system will automatically record signals from connected systems</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}