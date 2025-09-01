# TODO List - Alamiya Calendar SNG Implementation

## ✅ Completed Tasks

### 1. SNG Model & Backend
- [x] Create Sng model with id and code fields
- [x] Create database migration for sngs table
- [x] Create SngController with CRUD operations
- [x] Create SngResource for API responses
- [x] Add sng_id to events table migration
- [x] Update Event model with SNG relationship
- [x] Add SNG API routes
- [x] Create SngSeeder with initial data
- [x] Add SNG permissions to PermissionSeeder
- [x] Assign SNG permissions to roles in RoleSeeder
- [x] Update EventController to handle SNG data and validation
- [x] Implement SNG conflict validation similar to OB validation

### 2. Frontend API Integration
- [x] Add SNG methods to api.ts (getSngs, createSng, updateSng, deleteSng)
- [x] Update API interfaces to include SNG data
- [x] Add SNG hooks in useApi.ts
- [x] Update type definitions for SNG

### 3. Frontend Components
- [x] Add SNG to DropdownManager in Settings
- [x] Add SNG column and filtering to EventTableAdvanced
- [x] Add SNG to AddEventDialog
- [x] Add SNG to EditEventDialog
- [x] Add SNG to EventPopup
- [x] Pass SNG data through Index.tsx to EventTable
- [x] Add SNG to GuestDashboard event conversion

### 4. Calendar Improvements
- [x] Redesign MonthlyCalendar UI for better mobile responsiveness
- [x] Redesign WeeklyCalendar UI for better mobile responsiveness
- [x] Add diagonal line pattern for non-current month cells
- [x] Implement dynamic event colors based on event types
- [x] Add horizontal scroll for mobile in both calendars
- [x] Optimize padding and font sizes for mobile
- [x] Limit events shown per day with "+X more" indicator

### 5. SNG Filters Implementation
- [x] Add SNG filter to EventTableGuest with horizontal scroll
- [x] Add SNG filter to MonthlyCalendar with horizontal scroll
- [x] Add SNG filter to WeeklyCalendar with horizontal scroll
- [x] Implement SNG filtering logic in all components
- [x] Add SNG search functionality in filter dropdowns
- [x] Add SNG counter badges in filter buttons

### 6. Mobile UX Improvements
- [x] Add horizontal scroll containers for filters in all views
- [x] Prevent page-level horizontal scrolling on mobile
- [x] Optimize filter layout for mobile devices
- [x] Ensure filters scroll horizontally instead of page scrolling

## 🎯 Current Status
All major tasks have been completed successfully! The SNG feature is fully implemented across:
- Backend (Models, Controllers, Migrations, Seeders, Permissions)
- Frontend (API integration, Components, Filters, Calendar views)
- Mobile optimization (Horizontal scroll for filters, responsive design)

## 🚀 Next Steps (Optional)
- [ ] Add SNG management to admin panel
- [ ] Implement SNG bulk operations
- [ ] Add SNG analytics/reporting
- [ ] Optimize SNG filter performance for large datasets
