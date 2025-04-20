import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertDefectSchema, Defect, User } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { FileUpload } from "@/components/ui/file-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DefectFormProps {
  defect?: Defect | null;
  onSuccess?: () => void;
}

const formSchema = insertDefectSchema
  .extend({
    assignedToId: z.number().optional().nullable(),
  })
  .omit({
    createdById: true,
  });

type DefectFormValues = z.infer<typeof formSchema>;

export function DefectForm({ defect, onSuccess }: DefectFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(
    defect?.photoUrl || undefined
  );

  // Fetch users for assignment dropdown
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!user,
  });

  const form = useForm<DefectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defect?.title || "",
      description: defect?.description || "",
      location: defect?.location || "",
      category: defect?.category || "mechanical",
      severity: defect?.severity || "medium",
      status: defect?.status || "new",
      assignedToId: defect?.assignedToId || null,
      photoUrl: defect?.photoUrl || "",
    },
  });

  // Set photo URL in form when it changes
  useEffect(() => {
    if (photoUrl !== undefined) {
      form.setValue("photoUrl", photoUrl || "");
    }
  }, [photoUrl, form]);

  const createMutation = useMutation({
    mutationFn: async (data: DefectFormValues) => {
      const res = await apiRequest("POST", "/api/defects", {
        ...data,
        createdById: user?.id,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Defect created",
        description: "The defect has been successfully created.",
      });
      form.reset();
      setPhotoUrl(undefined);
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create defect: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: DefectFormValues) => {
      if (!defect) return null;
      const res = await apiRequest("PUT", `/api/defects/${defect.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Defect updated",
        description: "The defect has been successfully updated.",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update defect: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: DefectFormValues) => {
    if (defect) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="text-xl font-semibold mb-4">
          {defect ? "Edit Defect" : "Create New Defect"}
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Defect Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter a descriptive title"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="mechanical">Mechanical</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="structural">Structural</SelectItem>
                    <SelectItem value="control">Control</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide detailed information about the defect"
                  className="resize-none"
                  rows={4}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="Specify the location within the plant"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignedToId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign To</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={(value) =>
                    value === "unassigned" ? field.onChange(null) : field.onChange(parseInt(value))
                  }
                  defaultValue={
                    field.value ? field.value.toString() : "unassigned"
                  }
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="photoUrl"
          render={({ field }) => (
            <FormItem>
              <FileUpload
                existingUrl={photoUrl}
                onFileUploaded={(url) => setPhotoUrl(url)}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onSuccess) onSuccess();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {defect ? "Update Defect" : "Create Defect"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
