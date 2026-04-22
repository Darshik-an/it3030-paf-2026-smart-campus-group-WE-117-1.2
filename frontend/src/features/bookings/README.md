# Booking Management Feature - Implementation Guide

## Overview
Complete UI/UX for booking management module with mock data. All pages and components are ready to integrate with the backend API.

## Directory Structure
```
src/features/bookings/
├── pages/
│   ├── BrowseResources.jsx      # Browse & filter resources
│   ├── ResourceDetails.jsx       # View resource details
│   ├── CreateBooking.jsx         # Create new booking
│   ├── MyBookings.jsx            # View user's bookings
│   └── BookingDetails.jsx        # View booking details
├── components/
│   ├── BookingForm.jsx           # Reusable booking form
│   ├── BookingCard.jsx           # Booking card component
│   ├── BookingStatus.jsx         # Status badge component
│   ├── ResourceCard.jsx          # Resource card component
│   └── ResourceFilters.jsx       # Filter component
├── context/
│   └── BookingContext.jsx        # State management
├── data/
│   └── mockResources.js          # Mock resource data
└── index.js                      # Export all components
```

## How to Use

### 1. Install Dependencies
```
npm install
```

### 2. Add Routes to Your App
Import and use the booking routes in your main `App.jsx`:

```jsx
import { BookingProvider, BrowseResources, MyBookings, CreateBooking } from './features/bookings';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BookingProvider>
      <Routes>
        <Route path="/resources" element={<BrowseResources />} />
        <Route path="/bookings/create" element={<CreateBooking />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        {/* Add other routes... */}
      </Routes>
    </BookingProvider>
  );
}
```

### 3. Protected Routes
Add authentication check when implementing with auth:

```jsx
import { useAuth } from './features/auth';
import ProtectedRoute from './features/auth/components/ProtectedRoute';

<Route 
  path="/my-bookings" 
  element={
    <ProtectedRoute>
      <MyBookings />
    </ProtectedRoute>
  }
/>
```

### 4. Navigation Links
Add these links to your Navbar/Sidebar:

```jsx
<Link to="/resources">Browse Resources</Link>
<Link to="/my-bookings">My Bookings</Link>
<Link to="/bookings/create">New Booking</Link>
```

## Page Details

### BrowseResources (`/resources`)
- Lists all available resources
- Search by name/location
- Filter by type and capacity
- Click resource to view details
- **Status**: ✅ Complete with mock data

### ResourceDetails (`/resources/:id`)
- Full resource information
- Request booking button
- See similar resources
- **Status**: ✅ Complete with mock data

### CreateBooking (`/bookings/create`)
- Form with validation
- Optional pre-selected resource via query param: `?resourceId=1`
- Real-time validation
- **Status**: ✅ Complete (connects to BookingContext)

### MyBookings (`/my-bookings`)
- List user's bookings
- Filter by status (PENDING, APPROVED, REJECTED, CANCELLED)
- View/Cancel actions
- **Status**: ✅ Complete (uses BookingContext)

### BookingDetails (`/bookings/:id`)
- Full booking information
- Booking timeline
- Cancel option for approved bookings
- **Status**: ✅ Complete (uses BookingContext)

## Backend Integration (TODO)

### Replace Mock Data with API Calls

**In `CreateBooking.jsx`:**
```jsx
const handleSubmit = async (formData) => {
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    navigate(`/bookings/${data.id}`);
  } catch (err) {
    setError(err.message);
  }
};
```

**In `BookingContext.jsx`:**
Replace the local state management with API calls when backend is ready.

**In `BrowseResources.jsx`:**
Replace `mockResources` with API call:
```jsx
useEffect(() => {
  fetch('/api/resources')
    .then(res => res.json())
    .then(data => setResources(data))
    .catch(err => setError(err));
}, []);
```

## Required API Endpoints (for your backend)

| Method | Endpoint | Params/Body |
|--------|----------|------------|
| GET | `/api/resources` | filters: type, capacity, location |
| GET | `/api/resources/:id` | - |
| GET | `/api/bookings` | filters: status, resourceId |
| GET | `/api/bookings/:id` | - |
| POST | `/api/bookings` | { resourceId, bookingDate, startTime, endTime, purpose, expectedAttendees } |
| PATCH | `/api/bookings/:id` | { status } |
| DELETE | `/api/bookings/:id` | - |

## Component Props

### BookingForm
```jsx
<BookingForm
  onSubmit={(formData) => handleSubmit(formData)}
  isLoading={false}
  initialResourceId={null}
/>
```

### BookingCard
```jsx
<BookingCard
  booking={{
    id: 1,
    resourceName: "Lecture Hall A",
    purpose: "Class lecture",
    bookingDate: "2026-04-20",
    startTime: "09:00",
    endTime: "10:00",
    expectedAttendees: 50,
    location: "Building A",
    status: "PENDING",
    rejectionReason: null
  }}
/>
```

### ResourceCard
```jsx
<ResourceCard
  resource={{
    id: 1,
    name: "Lecture Hall A",
    type: "LECTURE_HALL",
    capacity: 100,
    location: "Building A - Floor 2",
    status: "ACTIVE",
    availability: "Mon-Fri: 08:00-18:00"
  }}
/>
```

## Styling
- Uses **Tailwind CSS** classes
- Responsive design (mobile, tablet, desktop)
- Color scheme: Blue primary, green for success, red for alerts
- Consistent spacing and typography

## Testing

### Mock Data
All components work with the provided `mockResources.js` without backend.

### Test Workflows
1. Browse resources → View details → Create booking
2. Create booking → View in My Bookings
3. Filter bookings by status
4. View booking details and cancel (if approved)

## Status Badges
- 🟡 PENDING - Yellow
- 🟢 APPROVED - Green
- 🔴 REJECTED - Red
- ⚫ CANCELLED - Gray

## Next Steps

1. ✅ **UI/UX Created** - All pages and components built
2. ⏳ **Backend Integration** - Connect to Spring Boot API
3. ⏳ **Authentication** - Integrate with auth context
4. ⏳ **Notifications** - Add notification panel
5. ⏳ **Conflict Detection** - Check for booking conflicts
6. ⏳ **Testing** - Unit and integration tests

## Notes
- All components are fully functional with mock data
- Uses React Router for navigation
- Context API for state management
- Tailwind CSS for styling
- Fully responsive design
- Error handling and validation included
