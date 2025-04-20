import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable } from "@/components/ui/data-table";
import { Signal } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { formatDistanceToNow } from "date-fns";

export default function SignalsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch signals
  const { data: signals = [] } = useQuery<Signal[]>({
    queryKey: ["/api/signals"],
  });
  
  // Format date for display
  const formatDate = (dateStr: Date) => {
    const date = new Date(dateStr);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  // Filter signals based on search term
  const filteredSignals = signals.filter(signal => 
    signal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    signal.source.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Prepare chart data (using the first 10 signals)
  const chartData = signals.slice(0, 10).map(signal => ({
    name: signal.name,
    value: parseFloat(signal.value),
    unit: signal.unit,
    time: new Date(signal.createdAt).toLocaleTimeString(),
  }));
  
  const columns = [
    {
      accessorKey: "name",
      header: "Signal Name",
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => {
        const signal = row.original;
        return (
          <span>
            {signal.value} {signal.unit}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let statusClass = "bg-green-100 text-green-800";
        if (status === "warning") {
          statusClass = "bg-yellow-100 text-yellow-800";
        } else if (status === "critical") {
          statusClass = "bg-red-100 text-red-800";
        }
        
        return (
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: "source",
      header: "Source",
    },
    {
      accessorKey: "createdAt",
      header: "Time",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
  ];
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 md:ml-64">
        <Header onSearch={handleSearch} />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <PageHeader 
            title="Signals" 
            subtitle="Monitor real-time system signals"
          />
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Signal Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#0052CC" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg">
            <DataTable
              columns={columns}
              data={filteredSignals}
              exportable
              exportOptions={{
                title: "Power Plant Signals",
                filename: "power-plant-signals"
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
