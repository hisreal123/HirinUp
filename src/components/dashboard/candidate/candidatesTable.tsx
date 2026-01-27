import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CandidateData = {
  id: number;
  email: string | null;
  name: string | null;
  full_name: string | null;
  phone: string | null;
  gender: string | null;
  country: string | null;
  portfolio_website: string | null;
  social_media_links: Record<string, any> | null;
  work_experience: Record<string, any> | null;
  created_at: string;
};

interface CandidatesTableProps {
  data: CandidateData[];
  searchQuery?: string;
}

function CandidatesTable({ data, searchQuery = "" }: CandidatesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState(searchQuery);

  // Sync searchQuery prop with globalFilter
  useEffect(() => {
    setGlobalFilter(searchQuery);
  }, [searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatWorkExperience = (workExp: Record<string, any> | null) => {
    if (!workExp) return "N/A";
    const years = workExp.years || "N/A";
    const company = workExp.company || "N/A";
    return `${years} years${company !== "N/A" ? ` at ${company}` : ""}`;
  };

  const formatSocialMedia = (socialMedia: Record<string, any> | null) => {
    if (!socialMedia) return null;
    const links = [];
    if (socialMedia.linkedin) links.push(socialMedia.linkedin);
    if (socialMedia.twitter) links.push(socialMedia.twitter);
    return links.length > 0 ? links.join(", ") : null;
  };

  const extractCountryCode = (phone: string | null) => {
    if (!phone) return "N/A";
    // Phone numbers are stored with country code (e.g., +1234567890)
    // Extract the country code (everything before the first space or after +)
    const match = phone.match(/^\+?(\d{1,4})/);
    if (match) {
      return `+${match[1]}`;
    }
    return "N/A";
  };

  const columns: ColumnDef<CandidateData>[] = [
    {
      accessorKey: "full_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`w-full justify-start font-semibold text-[15px] ${
              column.getIsSorted() ? "text-primary" : "text-black"
            }`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Full Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const name = row.getValue("full_name") as string;
        return (
          <span className="font-medium">{name || "N/A"}</span>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const a = (rowA.getValue(columnId) as string) || "";
        const b = (rowB.getValue(columnId) as string) || "";
        return a.toLowerCase().localeCompare(b.toLowerCase());
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`w-full justify-start font-semibold text-[15px] ${
              column.getIsSorted() ? "text-primary" : "text-black"
            }`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const email = row.getValue("email") as string;
        return <span>{email || "N/A"}</span>;
      },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string;
        // Display the full phone number with country code as stored
        return <span>{phone || "N/A"}</span>;
      },
    },
    {
      accessorKey: "country",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`w-full justify-start font-semibold text-[15px] ${
              column.getIsSorted() ? "text-primary" : "text-black"
            }`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Country
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const country = row.getValue("country") as string;
        return <span>{country || "N/A"}</span>;
      },
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => {
        const gender = row.getValue("gender") as string;
        return (
          <span className="capitalize">{gender || "N/A"}</span>
        );
      },
    },
    {
      accessorKey: "work_experience",
      header: "Experience",
      cell: ({ row }) => {
        const workExp = row.original.work_experience;
        return <span>{formatWorkExperience(workExp)}</span>;
      },
    },
    // {
    //   accessorKey: "portfolio_website",
    //   header: "Portfolio",
    //   cell: ({ row }) => {
    //     const portfolio = row.getValue("portfolio_website") as string;
    //     if (!portfolio) return <span>N/A</span>;
    //     return (
    //       <TooltipProvider>
    //         <Tooltip>
    //           <TooltipTrigger asChild>
    //             <a
    //               href={portfolio}
    //               target="_blank"
    //               rel="noopener noreferrer"
    //               className="text-primary hover:underline flex items-center gap-1"
    //             >
    //               <ExternalLink size={14} />
    //               View
    //             </a>
    //           </TooltipTrigger>
    //           <TooltipContent
    //             side="top"
    //             className="bg-gray-500 text-white font-normal"
    //           >
    //             {portfolio}
    //           </TooltipContent>
    //         </Tooltip>
    //       </TooltipProvider>
    //     );
    //   },
    // },
    {
      accessorKey: "social_media_links",
      header: "Social Media",
      cell: ({ row }) => {
        const socialMedia = row.original.social_media_links;
        if (!socialMedia) return <span>N/A</span>;
        
        const links = [];
        if (socialMedia.linkedin) links.push({ url: socialMedia.linkedin, label: "LinkedIn" });
        if (socialMedia.twitter) links.push({ url: socialMedia.twitter, label: "Twitter" });
        
        if (links.length === 0) return <span>N/A</span>;
        
        return (
          <div className="max-w-md flex flex-col gap-1">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm break-words flex items-center gap-1"
              >
                <ExternalLink size={12} />
                {link.url}
              </a>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            className={`w-full justify-start font-semibold text-[15px] ${
              column.getIsSorted() ? "text-primary" : "text-black"
            }`}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created At
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return <span>{formatDate(date)}</span>;
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const search = filterValue.toLowerCase();
      const fullName = (row.getValue("full_name") as string)?.toLowerCase() || "";
      const email = (row.getValue("email") as string)?.toLowerCase() || "";
      const phone = (row.getValue("phone") as string)?.toLowerCase() || "";
      const country = (row.getValue("country") as string)?.toLowerCase() || "";
      const gender = (row.getValue("gender") as string)?.toLowerCase() || "";
      
      return (
        fullName.includes(search) ||
        email.includes(search) ||
        phone.includes(search) ||
        country.includes(search) ||
        gender.includes(search)
      );
    },
    state: {
      sorting,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (data.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-gray-500">No candidates found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-left align-middle">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="text-left align-middle py-2"
                    >
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
      
      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show:</span>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-700">per page</span>
          </div>
          <div className="text-sm text-gray-700">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{" "}
            of {table.getFilteredRowModel().rows.length} candidates
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CandidatesTable;

