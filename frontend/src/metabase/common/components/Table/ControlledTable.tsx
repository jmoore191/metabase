import React from "react";

import { PaginationControls } from "metabase/components/PaginationControls";
import { color } from "metabase/lib/colors";
import { Box, Flex, Icon } from "metabase/ui";

type BaseRow = Record<string, unknown> & { id: number | string };

type ColumnItem = {
  name: string;
  key: string;
  sortable?: boolean;
};

type sortProps = { name: string; direction: "asc" | "desc" };

export type TableProps<Row extends BaseRow> = {
  columns: ColumnItem[];
  rows: Row[];
  rowRenderer: (row: Row) => React.ReactNode;
  tableProps?: React.HTMLAttributes<HTMLTableElement> & { className: string };
  sortColumn?: sortProps;
  onSort?: (props: sortProps) => void;
  onPageChange?: (page: number) => void;
  page?: number;
  totalItems?: number;
};

/**
 * A basic reusable table component that supports client-side sorting by a column
 *
 * @param columns     - an array of objects with name and key properties
 * @param rows        - an array of objects with keys that match the column keys
 * @param rowRenderer - a function that takes a row object and returns a <tr> element
 * @param tableProps  - additional props to pass to the <table> element
 */

export function ControlledTable<Row extends BaseRow>({
  columns,
  rows,
  rowRenderer,
  sortColumn,
  onSort,
  page,
  onPageChange,
  totalItems,
  ...rest
}: TableProps<Row>) {
  return (
    <>
      <table {...rest}>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={String(column.key)}>
                {onSort && column.sortable ? (
                  <ColumnHeader
                    column={column}
                    sortColumn={sortColumn?.name}
                    sortDirection={sortColumn?.direction}
                    onSort={(columnKey: string, direction: "asc" | "desc") => {
                      onSort({ name: columnKey, direction });
                    }}
                  />
                ) : (
                  column.name
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <React.Fragment key={String(row.id) || index}>
              {rowRenderer(row)}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {onPageChange && page !== undefined && (
        <Flex justify="end">
          <PaginationControls
            page={page}
            pageSize={3}
            total={totalItems}
            itemsLength={rows.length}
            onNextPage={() => onPageChange(page + 1)}
            onPreviousPage={() => onPageChange(page - 1)}
          />
        </Flex>
      )}
    </>
  );
}

function ColumnHeader({
  column,
  sortColumn,
  sortDirection,
  onSort,
}: {
  column: ColumnItem;
  sortColumn?: string | null;
  sortDirection?: "asc" | "desc";
  onSort: (column: string, direction: "asc" | "desc") => void;
}) {
  return (
    <Flex
      gap="sm"
      align="center"
      style={{ cursor: "pointer" }}
      onClick={() =>
        onSort(
          String(column.key),
          sortColumn === column.key && sortDirection === "asc" ? "desc" : "asc",
        )
      }
    >
      {column.name}
      {
        column.name && column.key === sortColumn ? (
          <Icon
            name={sortDirection === "desc" ? "chevronup" : "chevrondown"}
            color={color("text-medium")}
            style={{ flexShrink: 0 }}
            size={8}
          />
        ) : (
          <Box w="8px" />
        ) // spacer to keep the header the same size regardless of sort status
      }
    </Flex>
  );
}
