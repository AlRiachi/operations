import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { exportToPdf, exportToExcel } from "@/lib/export-utils";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Event, Defect } from "@shared/schema";

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState<string>("last_30d");
  const [reportType, setReportType] = useState<string>("events");
  
  // Fetch events and defects
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  
  const { data: defects = [] } = useQuery<Defect[]>({
    queryKey: ["/api/defects"],
  });
  
  // Prepare data for event status chart
  const eventStatusData = [
    { name: 'New', value: events.filter(e => e.status === 'new').length },
    { name: 'In Progress', value: events.filter(e => e.status === 'in_progress').length },
    { name: 'Resolved', value: events.filter(e => e.status === 'resolved').length },
    { name: 'Closed', value: events.filter(e => e.status === 'closed').length },
  ].filter(item => item.value > 0);
  
  // Prepare data for event category chart
  const eventCategoryData = [
    { name: 'Operations', value: events.filter(e => e.category === 'operations').length },
    { name: 'Maintenance', value: events.filter(e => e.category === 'maintenance').length },
    { name: 'Safety', value: events.filter(e => e.category === 'safety').length },
    { name: 'Environmental', value: events.filter(e => e.category === 'environmental').length },
  ].filter(item => item.value > 0);
  
  // Prepare data for defect severity chart
  const defectSeverityData = [
    { name: 'Low', value: defects.filter(d => d.severity === 'low').length },
    { name: 'Medium', value: defects.filter(d => d.severity === 'medium').length },
    { name: 'High', value: defects.filter(d => d.severity === 'high').length },
    { name: 'Critical', value: defects.filter(d => d.severity === 'critical').length },
  ].filter(item => item.value > 0);
  
  // Prepare data for defect category chart
  const defectCategoryData = [
    { name: 'Mechanical', value: defects.filter(d => d.category === 'mechanical').length },
    { name: 'Electrical', value: defects.filter(d => d.category === 'electrical').length },
    { name: 'Structural', value: defects.filter(d => d.category === 'structural').length },
    { name: 'Control', value: defects.filter(d => d.category === 'control').length },
    { name: 'Other', value: defects.filter(d => d.category === 'other').length },
  ].filter(item => item.value > 0);
  
  const COLORS = ['#0052CC', '#00875A', '#6554C0', '#FF5630', '#36B37E'];
  
  const handleExportToPdf = () => {
    const title = reportType === "events" ? "Events Report" : "Defects Report";
    const filename = reportType === "events" ? "events-report" : "defects-report";
    
    const data = reportType === "events" ? events : defects;
    const columns = reportType === "events" 
      ? [
          { header: "ID", key: "id" },
          { header: "Title", key: "title" },
          { header: "Category", key: "category" },
          { header: "Status", key: "status" },
          { header: "Priority", key: "priority" },
          { header: "Location", key: "location" },
        ]
      : [
          { header: "ID", key: "id" },
          { header: "Title", key: "title" },
          { header: "Category", key: "category" },
          { header: "Severity", key: "severity" },
          { header: "Status", key: "status" },
          { header: "Location", key: "location" },
        ];
    
    exportToPdf(data, columns, { title, filename });
  };
  
  const handleExportToExcel = () => {
    const title = reportType === "events" ? "Events Report" : "Defects Report";
    const filename = reportType === "events" ? "events-report" : "defects-report";
    
    const data = reportType === "events" ? events : defects;
    const columns = reportType === "events" 
      ? [
          { header: "ID", key: "id" },
          { header: "Title", key: "title" },
          { header: "Description", key: "description" },
          { header: "Category", key: "category" },
          { header: "Status", key: "status" },
          { header: "Priority", key: "priority" },
          { header: "Location", key: "location" },
          { header: "Created At", key: "createdAt" },
          { header: "Updated At", key: "updatedAt" },
        ]
      : [
          { header: "ID", key: "id" },
          { header: "Title", key: "title" },
          { header: "Description", key: "description" },
          { header: "Category", key: "category" },
          { header: "Severity", key: "severity" },
          { header: "Status", key: "status" },
          { header: "Location", key: "location" },
          { header: "Created At", key: "createdAt" },
          { header: "Updated At", key: "updatedAt" },
        ];
    
    exportToExcel(data, columns, { title, filename });
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 md:ml-64">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <PageHeader 
            title="Reports" 
            subtitle="Generate and export reports"
          >
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
              <Select 
                value={reportType} 
                onValueChange={setReportType}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="events">Events Report</SelectItem>
                  <SelectItem value="defects">Defects Report</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={timeRange} 
                onValueChange={setTimeRange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last_24h">Last 24 hours</SelectItem>
                  <SelectItem value="last_7d">Last 7 days</SelectItem>
                  <SelectItem value="last_30d">Last 30 days</SelectItem>
                  <SelectItem value="all_time">All time</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="default" 
                  onClick={handleExportToPdf}
                  className="flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="default" 
                  onClick={handleExportToExcel}
                  className="flex items-center"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
              </div>
            </div>
          </PageHeader>
          
          <Tabs value={reportType} onValueChange={setReportType}>
            <TabsList className="mb-6">
              <TabsTrigger value="events">Events Report</TabsTrigger>
              <TabsTrigger value="defects">Defects Report</TabsTrigger>
            </TabsList>
            
            <TabsContent value="events" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Status Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center">
                      {eventStatusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={eventStatusData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {eventStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center text-gray-500">No data available</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Event Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center">
                      {eventCategoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={eventCategoryData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#0052CC" name="Count" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center text-gray-500">No data available</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Events Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-neutral-100 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Total Events</div>
                      <div className="text-3xl font-semibold mt-2">{events.length}</div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-blue-600">New</div>
                      <div className="text-3xl font-semibold mt-2">
                        {events.filter(e => e.status === 'new').length}
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-yellow-600">In Progress</div>
                      <div className="text-3xl font-semibold mt-2">
                        {events.filter(e => e.status === 'in_progress').length}
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-green-600">Resolved</div>
                      <div className="text-3xl font-semibold mt-2">
                        {events.filter(e => e.status === 'resolved' || e.status === 'closed').length}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="defects" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Defect Severity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center">
                      {defectSeverityData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={defectSeverityData}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {defectSeverityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center text-gray-500">No data available</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Defect Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center">
                      {defectCategoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={defectCategoryData}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#6554C0" name="Count" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center text-gray-500">No data available</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Defects Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-neutral-100 p-4 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Total Defects</div>
                      <div className="text-3xl font-semibold mt-2">{defects.length}</div>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-red-600">Critical</div>
                      <div className="text-3xl font-semibold mt-2">
                        {defects.filter(d => d.severity === 'critical').length}
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-yellow-600">Pending</div>
                      <div className="text-3xl font-semibold mt-2">
                        {defects.filter(d => d.status === 'new' || d.status === 'assigned' || d.status === 'in_progress').length}
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm font-medium text-green-600">Resolved</div>
                      <div className="text-3xl font-semibold mt-2">
                        {defects.filter(d => d.status === 'resolved' || d.status === 'closed').length}
                      </div>
                    </div>
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
