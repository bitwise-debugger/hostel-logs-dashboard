# Warden Requirements Implementation Plan

## ✅ Completed

1. **Login/Authentication System**
   - Created `src/pages/Login.jsx`
   - Uses environment variables for credentials
   - Stores auth in localStorage as `dormsyncscanner_auth`
   - `.env.example` created with sample credentials

2. **Notifications Page**
   - Changed to "Under Development" placeholder
   - Simple construction icon with message

## 🔄 In Progress - Major Changes Needed

### 1. New CSV Format
**Current columns**: DateTime, QR Code, Status
**New columns**: Date, Time, QR_Code, Status, Name, Hostel, RoomNo, MobileNo, Image_Path

**Changes needed**:
- Update CSV parsing in App.jsx
- Combine Date + Time into DateTime for processing
- Use new column names throughout
- Remove allotments.csv dependency (data now in scan_logs.csv)

### 2. Remote Data Source
**URL**: `https://raw.githubusercontent.com/G5-UOGIAN/scanner-logs/main/scan_logs.csv`

**Changes needed**:
- Update `loadData()` in App.jsx to fetch from GitHub
- Add last sync time display
- Handle CORS if needed
- Add refresh/reload functionality

### 3. Dashboard Widgets (from Reports)
**Requirements**:
- Move analytics widgets to Dashboard
- 2 widgets per row layout
- Show above existing content
- Widgets: Total Boarders/Non-Boarders, Peak Time, Late Entries (yellow), Invalid Scans (red)

### 4. Unique/All Toggle Button
**Requirements**:
- Shadcn-style button at top
- Text: "Unique" / "All Entries"
- Filters duplicate scans by same person
- Available on both Dashboard and Reports
- Re-renders data when toggled

### 5. Missing Boarders Tab
**Requirements**:
- Replace "Late Entries" tab
- Shows boarders who haven't scanned
- Based on allotments data vs scan logs
- Filter by date range

### 6. Stats Card Updates
**Changes**:
- Total Scans → Total Boarders + Non-Boarders (with small total mention)
- Late Entries → Yellow/warning color
- Invalid Scans → Red color

### 7. Image Path Settings
**Requirements**:
- Two path settings in Settings page:
  1. Student profile images folder (e.g., `/images/students/`)
  2. Scan capture images folder (from Image_Path column)
- Profile image naming: `{rollnumber}.png` or `.jpg`
- Scan image from CSV Image_Path column

### 8. Authentication Integration
**Requirements**:
- Wrap App in auth check
- Show Login page if not authenticated
- Logout button in sidebar/settings
- Persist auth across refreshes

## Implementation Order

1. ✅ Create Login component
2. ✅ Update Notifications to Under Development
3. Update CSV parsing for new format
4. Switch to remote GitHub data source
5. Add authentication wrapper to App
6. Move widgets to Dashboard
7. Implement Unique/All toggle
8. Update stats cards with colors
9. Replace Late Entries with Missing Boarders
10. Add image path settings
11. Add last sync display
12. Test all functionality

## Files to Modify

- `src/App.jsx` - Main data loading, auth wrapper, unique toggle
- `src/pages/Login.jsx` - ✅ Created
- `src/pages/Notifications.jsx` - ✅ Updated
- `src/pages/Settings.jsx` - Add image path settings
- `src/components/StatsCard.jsx` - Add color variants
- `src/components/Sidebar.jsx` - Add logout button
- `.env.example` - ✅ Created

## Environment Variables

```env
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=password123
VITE_SCAN_LOGS_URL=https://raw.githubusercontent.com/G5-UOGIAN/scanner-logs/main/scan_logs.csv
```

## Notes

- All routes should remain accessible (no routing library needed)
- Authentication is simple localStorage-based
- CSV format change is breaking - need careful migration
- Image paths are configurable for flexibility
- Unique toggle affects display only, not data storage
