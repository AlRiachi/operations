import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Eye, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SignalForm } from "@/components/signals/signal-form";
import { Signal } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
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

interface SignalDetailsProps {
  signal: Signal;
  onClose: () => void;
}

function SignalDetails({ signal, onClose }: SignalDetailsProps) {
  const formatDate = (dateStr: Date) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Warning</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Normal</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">
        {signal.name.startsWith("forced_") 
          ? signal.name.replace("forced_", "") 
          : signal.name}
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Signal ID</h3>
          <p>#{`SIG-${signal.id}`}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          {getStatusBadge(signal.status)}
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Value</h3>
          <p>{signal.value} {signal.unit}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Source</h3>
          <p>{signal.source.includes("forced_") 
              ? signal.source.replace("forced_", "") 
              : signal.source}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Created At</h3>
          <p>{formatDate(signal.createdAt)}</p>
        </div>
      </div>
      
      <div className="flex items-center pt-2">
        <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
        <span className="text-sm">
          This is a <strong>forced signal</strong> which overrides normal process controls or sensor readings.
        </span>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

export function SignalList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedSignal, setSelectedSignal] = useState<Signal | null>(null);
  const [signalFormOpen, setSignalFormOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch signals
  const { data: signals = [], isLoading } = useQuery<Signal[]>({
    queryKey: ["/api/signals"],
  });
  
  // Only show forced signals
  const forcedSignals = signals.filter(s => 
    s.name.startsWith("forced_") || s.source.includes("forced"));
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/signals/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signals"] });
      toast({
        title: "Signal deleted",
        description: "The forced signal has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete signal: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Format date for display
  const formatDate = (dateStr: Date) => {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>;
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Warning</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Normal</Badge>;
    }
  };
  
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-medium">#{`SIG-${row.original.id}`}</span>,
    },
    {
      accessorKey: "name",
      header: "Signal Name",
      cell: ({ row }) => {
        const name = row.original.name;
        return (
          <span>
            {name.startsWith("forced_") ? name.replace("forced_", "") : name}
          </span>
        );
      },
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
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "createdAt",
      header: "Recorded",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const signal = row.original;
        const canEdit = user?.role === "admin" || signal.createdById === user?.id;
        
        return (
          <div className="flex space-x-2">
            {canEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => {
                  setSelectedSignal(signal);
                  setSignalFormOpen(true);
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
                setSelectedSignal(signal);
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
                  setSelectedSignal(signal);
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
  
  // Handler for signal creation/update
  const handleSignalSaved = () => {
    setSignalFormOpen(false);
    setSelectedSignal(null);
    // Invalidate signals query to refresh the list
    queryClient.invalidateQueries({ queryKey: ["/api/signals"] });
  };
  
  return (
    <div>
      <PageHeader 
        title="Forced Signals" 
        subtitle="Record and track forced signals in the system"
      >
        <Dialog open={signalFormOpen} onOpenChange={setSignalFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Record Forced Signal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogTitle className="text-xl font-semibold">
              {selectedSignal ? "Edit Forced Signal" : "Record Forced Signal"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Fill in the details below to {selectedSignal ? "update the" : "record a new"} forced signal.
            </DialogDescription>
            <SignalForm onSuccess={handleSignalSaved} signal={selectedSignal} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      
      <div className="bg-white shadow-sm rounded-lg">
        <DataTable
          columns={columns}
          data={forcedSignals}
          searchable
          searchColumn="name"
          exportable
          exportOptions={{
            title: "Forced Signals",
            filename: "forced-signals"
          }}
        />
      </div>
      
      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold">Forced Signal Details</DialogTitle>
          {selectedSignal && (
            <SignalDetails 
              signal={selectedSignal} 
              onClose={() => setViewDetailsOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected forced signal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedSignal) {
                  deleteMutation.mutate(selectedSignal.id);
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