# Component Library Documentation

## Overview
This document provides a comprehensive guide to all reusable components in the Comlab Issue Reporting Application.

---

## Layout Components

### PageHeader
A comprehensive page header with breadcrumbs and actions.

**Props:**
- `title` (string): Page title
- `description?` (string): Optional description
- `breadcrumbs?` (Breadcrumb[]): Navigation breadcrumbs
- `actions?` (ReactNode): Action buttons

**Usage:**
```tsx
<PageHeader
  title="Ticket Management"
  description="View and manage all support tickets"
  breadcrumbs={[
    { label: 'Dashboard', onClick: () => navigate('/') },
    { label: 'Tickets' }
  ]}
  actions={<button>Create Ticket</button>}
/>
```

---

## Display Components

### StatusBadge
Visual indicator for ticket status with color coding.

**Props:**
- `status` (TicketStatus): Current ticket status
- `size?` ('sm' | 'md' | 'lg'): Badge size (default: 'md')

**Usage:**
```tsx
<StatusBadge status="in_progress" size="sm" />
```

### RoleBadge
Display user role with appropriate icon and styling.

**Props:**
- `role` ('admin' | 'class_rep' | 'student'): User role
- `size?` ('sm' | 'md' | 'lg'): Badge size
- `showIcon?` (boolean): Show/hide icon (default: true)

**Usage:**
```tsx
<RoleBadge role="admin" size="md" />
```

### NotificationBadge
Badge showing unread count or notifications.

**Props:**
- `count` (number): Number to display
- `max?` (number): Maximum number before showing '+' (default: 99)
- `size?` ('sm' | 'md' | 'lg'): Badge size
- `position?` ('top-right' | 'top-left' | 'bottom-right' | 'bottom-left'): Position relative to parent

**Usage:**
```tsx
<div className="relative">
  <Bell />
  <NotificationBadge count={5} position="top-right" />
</div>
```

### StatCard
Card displaying a statistic with optional trend indicator.

**Props:**
- `icon` (LucideIcon): Icon component
- `label` (string): Stat label
- `value` (string | number): Stat value
- `color?` ('blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'orange'): Color theme
- `trend?` ({ value: number, isPositive: boolean }): Trend data
- `onClick?` (() => void): Click handler

**Usage:**
```tsx
<StatCard
  icon={AlertCircle}
  label="Open Tickets"
  value={42}
  color="blue"
  trend={{ value: 12, isPositive: true }}
  onClick={() => filterByStatus('submitted')}
/>
```

### TicketCard
Compact card view of a ticket for list displays.

**Props:**
- `ticket` (Ticket): Ticket data
- `onView` ((ticket: Ticket) => void): View handler
- `showAssignee?` (boolean): Show assigned user (default: false)

**Usage:**
```tsx
<TicketCard
  ticket={ticketData}
  onView={(ticket) => setSelectedTicket(ticket)}
  showAssignee={true}
/>
```

### ChartCard
Container for charts with consistent styling and export functionality.

**Props:**
- `title` (string): Chart title
- `description?` (string): Chart description
- `children` (ReactNode): Chart component
- `trend?` ({ value: number, isPositive: boolean, label?: string }): Trend indicator
- `onExport?` (() => void): Export handler
- `height?` (string): Chart height (default: '300px')

**Usage:**
```tsx
<ChartCard
  title="Tickets by Status"
  description="Distribution of tickets across statuses"
  trend={{ value: 15, isPositive: true, label: 'vs last month' }}
  onExport={exportChartData}
  height="400px"
>
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>...</PieChart>
  </ResponsiveContainer>
</ChartCard>
```

---

## Feedback Components

### LoadingSpinner
Loading indicator with optional message.

**Props:**
- `size?` ('sm' | 'md' | 'lg'): Spinner size (default: 'md')
- `message?` (string): Loading message

**Usage:**
```tsx
<LoadingSpinner size="lg" message="Loading tickets..." />
```

### EmptyState
Display when no data is available.

**Props:**
- `icon` (LucideIcon): Icon component
- `title` (string): Empty state title
- `description` (string): Description text
- `action?` ({ label: string, onClick: () => void }): Optional action button

**Usage:**
```tsx
<EmptyState
  icon={Inbox}
  title="No Tickets Found"
  description="There are no tickets matching your filters"
  action={{ label: 'Clear Filters', onClick: clearFilters }}
/>
```

### ValidationAlert
Alert for validation errors.

**Props:**
- `message` (string): Error message
- `onClose` (() => void): Close handler

**Usage:**
```tsx
{error && <ValidationAlert message={error} onClose={() => setError('')} />}
```

### ConfirmDialog
Confirmation dialog for destructive actions.

**Props:**
- `title` (string): Dialog title
- `message` (string): Confirmation message
- `onConfirm` (() => void): Confirm handler
- `onCancel` (() => void): Cancel handler
- `type?` ('danger' | 'warning' | 'info'): Dialog type

**Usage:**
```tsx
<ConfirmDialog
  title="Delete Ticket"
  message="Are you sure you want to delete this ticket? This action cannot be undone."
  onConfirm={handleDelete}
  onCancel={() => setShowDialog(false)}
  type="danger"
/>
```

### Tooltip
Hover tooltip for additional information.

**Props:**
- `content` (string): Tooltip text
- `children` (ReactNode): Element to attach tooltip to
- `position?` ('top' | 'bottom' | 'left' | 'right'): Tooltip position (default: 'top')
- `delay?` (number): Show delay in ms (default: 200)

**Usage:**
```tsx
<Tooltip content="Click to view details" position="top">
  <button>View</button>
</Tooltip>
```

---

## Input Components

### SearchFilter
Combined search and filter component.

**Props:**
- `searchPlaceholder?` (string): Search input placeholder
- `onSearchChange` ((value: string) => void): Search change handler
- `filters?` (FilterConfig[]): Filter configurations
- `showFilterButton?` (boolean): Show filter toggle (default: true)

**Usage:**
```tsx
<SearchFilter
  searchPlaceholder="Search tickets..."
  onSearchChange={setSearchQuery}
  filters={[
    {
      label: 'Status',
      options: [
        { label: 'All', value: 'all' },
        { label: 'Open', value: 'submitted' }
      ],
      value: statusFilter,
      onChange: setStatusFilter
    }
  ]}
/>
```

### DateRangePicker
Date range selector with quick presets.

**Props:**
- `startDate` (string): Start date (ISO format)
- `endDate` (string): End date (ISO format)
- `onStartDateChange` ((date: string) => void): Start date handler
- `onEndDateChange` ((date: string) => void): End date handler
- `label?` (string): Field label (default: 'Date Range')

**Usage:**
```tsx
<DateRangePicker
  startDate={startDate}
  endDate={endDate}
  onStartDateChange={setStartDate}
  onEndDateChange={setEndDate}
  label="Report Period"
/>
```

---

## Data Components

### DataTable
Sortable data table with custom rendering.

**Props:**
- `data` (T[]): Array of data items
- `columns` (Column<T>[]): Column configurations
- `onRowClick?` ((item: T) => void): Row click handler
- `emptyMessage?` (string): Empty state message
- `striped?` (boolean): Striped rows (default: true)

**Usage:**
```tsx
<DataTable
  data={tickets}
  columns={[
    { key: 'id', label: 'ID', sortable: true },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (ticket) => <StatusBadge status={ticket.status} />
    }
  ]}
  onRowClick={(ticket) => viewTicket(ticket)}
  emptyMessage="No tickets found"
/>
```

---

## Action Components

### ExportButton
Button for exporting data with multiple format options.

**Props:**
- `onExportCSV` (() => void): CSV export handler
- `onExportJSON?` (() => void): Optional JSON export handler
- `label?` (string): Button label (default: 'Export')

**Usage:**
```tsx
<ExportButton
  onExportCSV={exportToCSV}
  onExportJSON={exportToJSON}
  label="Export Data"
/>
```

### QuickActions
Dropdown menu for quick actions.

**Props:**
- `actions` (QuickAction[]): Array of actions
- `position?` ('left' | 'right'): Menu position (default: 'right')

**Usage:**
```tsx
<QuickActions
  actions={[
    { 
      label: 'Edit', 
      icon: Edit, 
      onClick: handleEdit,
      variant: 'default'
    },
    { 
      label: 'Delete', 
      icon: Trash2, 
      onClick: handleDelete,
      variant: 'danger'
    }
  ]}
/>
```

### BulkActions
Component for bulk operations on multiple items.

**Props:**
- `items` (T[]): Array of items
- `selectedIds` (string[]): Selected item IDs
- `onSelectionChange` ((ids: string[]) => void): Selection change handler
- `actions` (BulkAction[]): Available bulk actions
- `renderItem` ((item: T, isSelected: boolean, onToggle: () => void) => ReactNode): Item renderer

**Usage:**
```tsx
<BulkActions
  items={tickets}
  selectedIds={selectedTickets}
  onSelectionChange={setSelectedTickets}
  actions={[
    {
      label: 'Archive',
      icon: Archive,
      onClick: (ids) => archiveTickets(ids),
      requiresConfirmation: true
    }
  ]}
  renderItem={(ticket, isSelected, onToggle) => (
    <TicketCard ticket={ticket} onView={viewTicket} />
  )}
/>
```

---

## Progress Components

### ProgressStepper
Visual workflow progress indicator.

**Props:**
- `steps` (Step[]): Array of workflow steps
- `orientation?` ('horizontal' | 'vertical'): Layout direction (default: 'horizontal')

**Usage:**
```tsx
<ProgressStepper
  steps={[
    { label: 'Submitted', status: 'completed', description: 'Issue reported' },
    { label: 'In Progress', status: 'current', description: 'Being fixed' },
    { label: 'Resolved', status: 'upcoming', description: 'Issue fixed' }
  ]}
  orientation="horizontal"
/>
```

### ActivityTimeline
Timeline of ticket activities and changes.

**Props:**
- `activities` (Activity[]): Array of activity items

**Usage:**
```tsx
<ActivityTimeline
  activities={[
    {
      id: '1',
      type: 'status_change',
      title: 'Status changed to In Progress',
      timestamp: new Date(),
      user: 'admin@plv.edu.ph'
    }
  ]}
/>
```

---

## Media Components

### ImageLightbox
Full-screen image viewer with navigation.

**Props:**
- `images` (string[]): Array of image URLs
- `currentIndex` (number): Currently displayed image index
- `onClose` (() => void): Close handler
- `onNext?` (() => void): Next image handler
- `onPrevious?` (() => void): Previous image handler

**Usage:**
```tsx
{showLightbox && (
  <ImageLightbox
    images={ticket.images}
    currentIndex={currentImageIndex}
    onClose={() => setShowLightbox(false)}
    onNext={() => setCurrentImageIndex((i) => (i + 1) % images.length)}
    onPrevious={() => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)}
  />
)}
```

---

## Utility Components

### KeyboardShortcuts
Global keyboard shortcut handler with help modal.

**Props:**
- `shortcuts` (Shortcut[]): Array of keyboard shortcuts
- `enabled?` (boolean): Enable/disable shortcuts (default: true)

**Usage:**
```tsx
<KeyboardShortcuts
  shortcuts={[
    {
      key: 'n',
      description: 'Create new ticket',
      action: () => setShowCreateDialog(true),
      ctrl: true
    },
    {
      key: 'f',
      description: 'Focus search',
      action: () => searchInputRef.current?.focus(),
      ctrl: true
    }
  ]}
  enabled={true}
/>
```

---

## Best Practices

1. **Consistent Theming**: All components support dark mode automatically
2. **Accessibility**: Components include ARIA labels and keyboard navigation
3. **Responsive Design**: Components adapt to different screen sizes
4. **Type Safety**: Full TypeScript support with proper type definitions
5. **Composition**: Components are designed to work together seamlessly

## Component Import

Import components individually or use the barrel export:

```tsx
// Individual imports
import { StatusBadge } from './components/StatusBadge';

// Barrel import (recommended)
import { StatusBadge, TicketCard, DataTable } from './components';
```
