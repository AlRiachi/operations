import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/layout/page-header";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DefectForm } from "@/components/defects/defect-form";
import { Defect } from "@shared/schema";
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

interface DefectDetailsProps {
  defect: Defect;
  onClose: () => void;
}

function DefectDetails({ defect, onClose }: DefectDetailsProps) {
  const formatDate = (dateStr: Date) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{defect.title}</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Defect ID</h3>
          <p>#{`DF-${defect.id}`}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full status-badge-${defect.status}`}>
            {defect.status.replace('_', ' ').split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </span>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Category</h3>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full category-badge-${defect.category}`}>
            {defect.category.charAt(0).toUpperCase() + defect.category.slice(1)}
          </span>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Severity</h3>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full status-badge-${defect.severity}`}>
            {defect.severity.charAt(0).toUpperCase() + defect.severity.slice(1)}
          </span>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Created At</h3>
          <p>{formatDate(defect.createdAt)}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Updated At</h3>
          <p>{formatDate(defect.updatedAt)}</p>
        </div>
        
        <div className="col-span-2">
          <h3 className="text-sm font-medium text-gray-500">Location</h3>
          <p>{defect.location}</p>
        </div>
        
        <div className="col-span-2">
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          <p className="text-gray-700">{defect.description}</p>
        </div>
      </div>
      
      {defect.photoUrl && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Photo</h3>
          <img 
            src={defect.photoUrl} 
            alt="Defect" 
            className="max-w-md rounded-md border"
          />
        </div>
      )}
      
      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}

export function DefectList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDefect, setSelectedDefect] = useState<Defect | null>(null);
  const [defectFormOpen, setDefectFormOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch defects
  const { data: defects = [], isLoading } = useQuery<Defect[]>({
    queryKey: ["/api/defects"],
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/defects/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/defects"] });
      toast({
        title: "Defect deleted",
        description: "The defect has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete defect: ${error.message}`,
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
      header: "Defect ID",
      cell: ({ row }) => <span className="font-medium">#{`DF-${row.original.id}`}</span>,
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
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full status-badge-${row.original.severity}`}>
          {row.original.severity.charAt(0).toUpperCase() + row.original.severity.slice(1)}
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
        const defect = row.original;
        const canEdit = user?.role === "admin" || defect.createdById === user?.id;
        
        return (
          <div className="flex space-x-2">
            {canEdit && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => {
                  setSelectedDefect(defect);
                  setDefectFormOpen(true);
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
                setSelectedDefect(defect);
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
                  setSelectedDefect(defect);
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
  
  // Handler for defect creation/update
  const handleDefectSaved = () => {
    setDefectFormOpen(false);
    setSelectedDefect(null);
    // Invalidate defects query to refresh the list
    queryClient.invalidateQueries({ queryKey: ["/api/defects"] });
  };
  
  return (
    <div>
      <PageHeader 
        title="Defects" 
        subtitle="Manage and track all defects"
      >
        <Dialog open={defectFormOpen} onOpenChange={setDefectFormOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              New Defect
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogTitle className="text-xl font-semibold">
              {selectedDefect ? "Edit Defect" : "Create New Defect"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Fill in the details below to {selectedDefect ? "update the" : "create a new"} defect.
            </DialogDescription>
            <DefectForm onSuccess={handleDefectSaved} defect={selectedDefect} />
          </DialogContent>
        </Dialog>
      </PageHeader>
      
      <div className="bg-white shadow-sm rounded-lg">
        <DataTable
          columns={columns}
          data={defects}
          searchable
          searchColumn="title"
          exportable
          exportOptions={{
            title: "Power Plant Defects",
            filename: "power-plant-defects"
          }}
        />
      </div>
      
      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold">Defect Details</DialogTitle>
          {selectedDefect && (
            <DefectDetails 
              defect={selectedDefect} 
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
              This action cannot be undone. This will permanently delete the selected defect.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedDefect) {
                  deleteMutation.mutate(selectedDefect.id);
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
