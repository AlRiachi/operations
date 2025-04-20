import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText, FileSpreadsheet } from "lucide-react";
import { exportToPdf, exportToExcel } from "@/lib/export-utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchable?: boolean;
  searchColumn?: string;
  pagination?: boolean;
  exportable?: boolean;
  exportOptions?: {
    title: string;
    filename: string;
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchable = false,
  searchColumn,
  pagination = true,
  exportable = false,
  exportOptions
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  const handleExportToPdf = () => {
    if (!exportOptions) return;
    
    const exportColumns = columns.map(col => ({
      header: (col.header as string) || "",
      key: (col.accessorKey as string) || ""
    })).filter(col => col.key && col.header);
    
    exportToPdf(data, exportColumns, exportOptions);
  };
  
  const handleExportToExcel = () => {
    if (!exportOptions) return;
    
    const exportColumns = columns.map(col => ({
      header: (col.header as string) || "",
      key: (col.accessorKey as string) || ""
    })).filter(col => col.key && col.header);
    
    exportToExcel(data, exportColumns, exportOptions);
  };

  return (
    <div>
      {/* Search and Export Controls */}
      {(searchable || exportable) && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 space-y-4 md:space-y-0">
          {searchable && searchColumn && (
            <div className="w-full md:max-w-sm">
              <Input
                placeholder={`Search...`}
                value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn(searchColumn)?.setFilterValue(event.target.value)
                }
                className="w-full"
              />
            </div>
          )}
          
          {!searchable && <div className="hidden md:block" />}
          
          {exportable && exportOptions && (
            <div className="flex w-full md:w-auto justify-between md:justify-start space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportToPdf}
                className="flex items-center flex-1 md:flex-none justify-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span className="whitespace-nowrap">Export PDF</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportToExcel}
                className="flex items-center flex-1 md:flex-none justify-center"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                <span className="whitespace-nowrap">Export Excel</span>
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Table */}
      <div className="rounded-md border overflow-auto">
        <div className="min-w-max md:w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 space-y-3 sm:space-y-0">
          <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
            Showing{" "}
            <span className="font-medium">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>{" "}
            of <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-2 h-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-2 h-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
