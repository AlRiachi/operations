import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EventForm } from "@/components/events/event-form";
import { Event } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EventDetailsProps {
  event: Event;
  onClose: () => void;
}

function EventDetails({ event, onClose }: EventDetailsProps) {
  const formatDate = (dateStr: Date) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl md:text-2xl font-bold">{event.title}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Event ID</h3>
          <p>#{`EV-${event.id}`}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full status-badge-${event.status}`}>
            {event.status.replace('_', ' ').split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </span>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Category</h3>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full category-badge-${event.category}`}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </span>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Priority</h3>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full status-badge-${event.priority}`}>
            {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
          </span>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Created At</h3>
          <p>{formatDate(event.createdAt)}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Updated At</h3>
          <p>{formatDate(event.updatedAt)}</p>
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-sm font-medium text-gray-500">Location</h3>
          <p>{event.location}</p>
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          <p className="text-gray-700">{event.description}</p>
        </div>
      </div>
      
      {event.photoUrl && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Photo</h3>
          <img 
            src={event.photoUrl} 
            alt="Event" 
            className="w-full max-w-md rounded-md border"
          />
        </div>
      )}
      
      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

export function EventList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch events
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/events/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete event: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
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
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full status-badge-${row.original.priority}`}>
          {row.original.priority.charAt(0).toUpperCase() + row.original.priority.slice(1)}
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
      cell: ({ row }) => {
        const event = row.original;
        const canEdit = user?.role === "admin" || event.createdById === user?.id;
        
        return (
          <div className="flex space-x-2">
            {canEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => {
                  setSelectedEvent(event);
                  setEventFormOpen(true);
                }}
              >
                <span className="sr-only">Edit</span>
                <Pencil className="h-4 w-4 text-primary" />
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={() => {
                setSelectedEvent(event);
                setViewDetailsOpen(true);
              }}
            >
              <span className="sr-only">View</span>
              <Eye className="h-4 w-4 text-gray-500" />
            </Button>
            
            {canEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
                onClick={() => {
                  setSelectedEvent(event);
                  setDeleteDialogOpen(true);
                }}
              >
                <span className="sr-only">Delete</span>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];
  
  // Handler for event creation/update
  const handleEventSaved = () => {
    setEventFormOpen(false);
    setSelectedEvent(null);
    // Invalidate events query to refresh the list
    queryClient.invalidateQueries({ queryKey: ["/api/events"] });
  };
  
  return (
    <div>
      <PageHeader 
        title="Events" 
        subtitle="Manage and track all events"
      >
        <Dialog open={eventFormOpen} onOpenChange={setEventFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogTitle className="text-xl font-semibold">
              {selectedEvent ? "Edit Event" : "Create New Event"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Fill in the details below to {selectedEvent ? "update the" : "create a new"} event.
            </DialogDescription>
            <EventForm onSuccess={handleEventSaved} event={selectedEvent} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      
      <div className="bg-white shadow-sm rounded-lg">
        <DataTable
          columns={columns}
          data={events}
          searchable
          searchColumn="title"
          exportable
          exportOptions={{
            title: "Power Plant Events",
            filename: "power-plant-events"
          }}
        />
      </div>
      
      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold">Event Details</DialogTitle>
          {selectedEvent && (
            <EventDetails 
              event={selectedEvent} 
              onClose={() => setViewDetailsOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected event.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <AlertDialogCancel className="mt-2 sm:mt-0">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedEvent) {
                  deleteMutation.mutate(selectedEvent.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
