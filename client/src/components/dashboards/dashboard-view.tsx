import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, TimeRangeSelector } from "@/components/layout/page-header";
import { StatusCard, SystemHealthCard } from "@/components/layout/status-card";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Event, Defect } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { EventForm } from "@/components/events/event-form";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

export function DashboardView() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("last_24h");
  const [eventFormOpen, setEventFormOpen] = useState(false);
  
  // Fetch events
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  
  // Fetch defects
  const { data: defects = [] } = useQuery<Defect[]>({
    queryKey: ["/api/defects"],
  });
  
  // Get active events
  const activeEvents = events.filter(
    e => e.status === "new" || e.status === "in_progress"
  );
  
  // Get critical defects
  const criticalDefects = defects.filter(d => d.severity === "critical");
  
  // Calculate system health based on number of critical defects
  const calculateSystemHealth = () => {
    const totalDefects = defects.length;
    if (totalDefects === 0) return { percentage: 100, status: "good" as const };
    
    const criticalCount = criticalDefects.length;
    const percentage = Math.max(0, Math.floor(100 - (criticalCount / totalDefects) * 100));
    
    if (percentage > 90) return { percentage, status: "good" as const };
    if (percentage > 70) return { percentage, status: "warning" as const };
    return { percentage, status: "critical" as const };
  };
  
  const systemHealth = calculateSystemHealth();
  
  // Format date for display
  const formatDate = (dateStr: Date) => {
    const date = new Date(dateStr);
    return `${date.toISOString().split('T')[0]} ${date.toTimeString().split(' ')[0].substring(0, 5)}`;
  };
  
  const columns = [
    {
      accessorKey: "id",
      header: "Event ID",
      cell: ({ row }) => <span className="font-medium">#{`EV-${row.original.id}`}</span>,
    },
    {
      accessorKey: "title",
      header: "Description",
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full category-badge-${row.original.category}`}>
          {row.original.category.charAt(0).toUpperCase() + row.original.category.slice(1)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full status-badge-${row.original.status}`}>
          {row.original.status.replace('_', ' ').split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Edit</span>
            <i className="fas fa-edit text-primary"></i>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">View</span>
            <i className="fas fa-eye text-gray-400"></i>
          </Button>
        </div>
      ),
    },
  ];
  
  // Handler for event creation
  const handleEventCreated = () => {
    setEventFormOpen(false);
    // Invalidate events query to refresh the list
    queryClient.invalidateQueries({ queryKey: ["/api/events"] });
  };
  
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle="Overview of plant operations status"
      >
        <div className="flex space-x-3">
          <TimeRangeSelector
            value={timeRange}
            onChange={setTimeRange}
          />
          
          <Dialog open={eventFormOpen} onOpenChange={setEventFormOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <EventForm onSuccess={handleEventCreated} />
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>
      
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard
          title="Active Events"
          value={activeEvents.length}
          change={{ value: 8, positive: false }}
          indicator={`${activeEvents.filter(e => e.status === "new").length} unresolved`}
          linkText="View all"
          linkHref="/events"
        />
        
        <StatusCard
          title="Defects"
          value={defects.length}
          change={{ value: 12, positive: false }}
          indicator={`${criticalDefects.length} critical`}
          linkText="View all"
          linkHref="/defects"
        />
        
        <StatusCard
          title="Signals"
          value={856}
          change={{ value: 3, positive: true }}
          indicator="All normal"
          linkText="View all"
          linkHref="/signals"
        />
        
        <SystemHealthCard
          percentage={systemHealth.percentage}
          status={systemHealth.status}
        />
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent events table */}
        <div className="lg:col-span-2 bg-white shadow-sm rounded-lg">
          <DataTable
            columns={columns}
            data={events.slice(0, 4)}
            pagination={false}
            exportable={true}
            exportOptions={{
              title: "Recent Events",
              filename: "power-plant-events"
            }}
          />
        </div>
        
        {/* Critical defects */}
        <div className="lg:col-span-1 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-300 flex justify-between items-center">
            <h2 className="font-semibold">Critical Defects</h2>
            <span className="bg-destructive/10 text-destructive text-xs font-medium px-2 py-1 rounded-full">
              {criticalDefects.length} Active
            </span>
          </div>
          
          <div className="divide-y divide-neutral-300">
            {criticalDefects.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No critical defects</p>
              </div>
            ) : (
              criticalDefects.slice(0, 3).map((defect) => (
                <div key={defect.id} className="p-4 hover:bg-neutral-100">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-destructive/10">
                        <i className="fas fa-exclamation-triangle text-destructive"></i>
                      </span>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-textColor">{defect.title}</p>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(defect.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Assigned to: <span className="font-medium">
                          {defect.assignedToId ? "User" : "Unassigned"}
                        </span>
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                          Critical
                        </span>
                        <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                          View details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {criticalDefects.length > 0 && (
              <div className="p-4 bg-neutral-100 text-center">
                <Button variant="link" size="sm" className="text-sm p-0 h-auto">
                  View all critical defects
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
