import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Loader2, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function DataTable({
  columns,
  data,
  isLoading,
  searchable = true,
  searchPlaceholder = "Search",
  pageSize = 10,
  toolbarSlot,
  className,
}) {
  const memoColumns = useMemo(() => columns, [columns])
  const memoData = useMemo(() => data, [data])

  const [globalFilter, setGlobalFilter] = useState("")

  const table = useReactTable({
    data: memoData,
    columns: memoColumns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  return (
    <div className={cn("space-y-4", className)}>
      {(searchable || toolbarSlot) && (
        <div className="glass-panel flex flex-wrap items-center justify-between gap-3 p-3">
          {searchable ? (
            <div className="relative w-full max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
              />
            </div>
          ) : (
            <span />
          )}
          {toolbarSlot && <div className="flex items-center gap-2">{toolbarSlot}</div>}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/5">
        <table className="min-w-full divide-y divide-white/5 bg-black/20 text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-muted-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading
              ? Array.from({ length: pageSize }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`}>
                    <td colSpan={memoColumns.length} className="px-4 py-5">
                      <Skeleton className="h-6 w-full" />
                    </td>
                  </tr>
                ))
              : table.getRowModel().rows?.map((row) => (
                  <tr key={row.id} className="hover:bg-white/5">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-4 text-foreground/90">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading data…
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

