import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  TableOptions,
} from '@tanstack/react-table';
import { cn } from '../../utils/cn';
import { Skeleton } from './Skeleton';

interface TableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
  tableOptions?: Partial<TableOptions<T>>;
}

export function Table<T extends object>({
  data,
  columns,
  isLoading,
  emptyMessage = 'No data found',
  className,
  tableOptions,
}: TableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...tableOptions,
  });

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-surface-200', className)}>
      <table className="w-full text-sm">
        <thead className="bg-surface-50 border-b border-surface-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-xs font-semibold text-surface-600 uppercase tracking-wider"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-surface-100 bg-white">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-surface-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-surface-50 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-surface-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
