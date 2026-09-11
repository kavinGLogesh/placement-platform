import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  TextField,
  InputAdornment,
  TablePagination,
  Skeleton,
  TableSortLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export interface Column<T> {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  totalCount?: number;
  page?: number;
  rowsPerPage?: number;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (val: string) => void;
  onPageChange?: (newPage: number) => void;
  onRowsPerPageChange?: (newLimit: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (columnId: string) => void;
  actions?: React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  loading = false,
  totalCount,
  page = 0,
  rowsPerPage = 10,
  searchValue,
  searchPlaceholder = 'Search...',
  onSearchChange,
  onPageChange,
  onRowsPerPageChange,
  sortBy,
  sortOrder = 'asc',
  onSortChange,
  actions,
  emptyMessage = 'No records found',
}: DataTableProps<T>): React.ReactElement {
  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: 'rgba(17, 24, 39, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 2.5,
        overflow: 'hidden',
      }}
    >
      {/* Header Toolbar */}
      {(onSearchChange || actions) && (
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          {onSearchChange ? (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchValue ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: '100%', sm: 280 },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(11, 15, 25, 0.6)',
                  borderRadius: 2,
                },
              }}
            />
          ) : (
            <Box />
          )}

          {actions && <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>{actions}</Box>}
        </Box>
      )}

      {/* Table Container */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader size="medium">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  sx={{
                    minWidth: col.minWidth,
                    backgroundColor: '#111827',
                    color: 'text.secondary',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {col.sortable && onSortChange ? (
                    <TableSortLabel
                      active={sortBy === col.id}
                      direction={sortBy === col.id ? sortOrder : 'asc'}
                      onClick={() => onSortChange(col.id)}
                      sx={{
                        '&.Mui-active': { color: 'primary.light' },
                        '& .MuiTableSortLabel-icon': { color: 'primary.light !important' },
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, rIdx) => (
                <TableRow key={`skeleton-${rIdx}`}>
                  {columns.map((_, cIdx) => (
                    <TableCell key={`cell-sk-${cIdx}`}>
                      <Skeleton variant="text" sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }} height={28} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                  <InboxOutlinedIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
                  <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              // Data Rows
              data.map((row) => (
                <TableRow
                  key={String(row.id)}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.04) !important',
                    },
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      align={col.align || 'left'}
                      sx={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        color: 'text.primary',
                        fontSize: '0.875rem',
                      }}
                    >
                      {col.render ? col.render(row) : ((row as Record<string, unknown>)[col.id] as React.ReactNode) ?? '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalCount !== undefined && onPageChange && onRowsPerPageChange && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_e, newPage) => onPageChange(newPage)}
          onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            color: 'text.secondary',
          }}
        />
      )}
    </Paper>
  );
}
