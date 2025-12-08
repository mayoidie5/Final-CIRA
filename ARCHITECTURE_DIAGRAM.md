# Notifications System Architecture Diagram

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CIRA APPLICATION                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              App.tsx (Main Component)                    │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │         ThemeProvider (Dark/Light)               │   │   │
│  │  │                                                  │   │   │
│  │  │  ┌────────────────────────────────────────────┐ │   │   │
│  │  │  │    AuthProvider (User Authentication)      │ │   │   │
│  │  │  │                                            │ │   │   │
│  │  │  │  ┌──────────────────────────────────────┐ │ │   │   │
│  │  │  │  │  NotificationProvider (NEW) ✨       │ │ │   │   │
│  │  │  │  │                                      │ │ │   │   │
│  │  │  │  │  ┌──────────────────────────────┐  │ │ │   │   │
│  │  │  │  │  │    AppContent Component      │  │ │ │   │   │
│  │  │  │  │  │    - Header                  │  │ │ │   │   │
│  │  │  │  │  │    - Sidebar Navigation      │  │ │ │   │   │
│  │  │  │  │  │    - Main Content Area       │  │ │ │   │   │
│  │  │  │  │  │    - Pages (Dashboard,       │  │ │ │   │   │
│  │  │  │  │  │      Notifications, etc.)    │  │ │ │   │   │
│  │  │  │  │  └──────────────────────────────┘  │ │ │   │   │
│  │  │  │  │                                      │ │ │   │   │
│  │  │  │  └──────────────────────────────────────┘ │ │   │   │
│  │  │  │                                            │ │   │   │
│  │  │  └────────────────────────────────────────────┘ │   │   │
│  │  │                                                  │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                             │
│               (Click buttons in UI)                             │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│              Component (NotificationList.tsx)                   │
│  - Displays notifications                                      │
│  - Handles button clicks                                       │
│  - Shows loading/empty states                                  │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│         useNotifications() Hook (from Context)                  │
│  - Provides state and functions                                │
│  - Manages local state updates                                 │
│  - Handles errors gracefully                                   │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│        notificationService Functions                            │
│  - Direct Firestore operations                                 │
│  - Database queries                                            │
│  - Error handling                                              │
└────────────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────────────┐
│           Firestore Database (Cloud)                            │
│  - notifications collection                                    │
│  - User-specific queries                                       │
│  - Persistent storage                                          │
└────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Hierarchy

```
App.tsx
├── ThemeProvider
│   └── AuthProvider
│       └── NotificationProvider ✨ NEW
│           └── AppContent
│               ├── Header
│               │   ├── Logo
│               │   ├── User Menu
│               │   └── NotificationBadgeIcon ✨ NEW
│               │
│               ├── Sidebar
│               │   └── Navigation Items
│               │       ├── Dashboard
│               │       ├── Notifications ✨ NEW
│               │       ├── Report Issue
│               │       ├── Tickets
│               │       └── ...
│               │
│               └── Main Content (renderPage())
│                   ├── Dashboard
│                   ├── Notifications ✨ NEW
│                   │   └── NotificationList ✨ NEW
│                   ├── ReportIssue
│                   ├── TicketList
│                   └── ...
```

---

## 📊 State Management Flow

```
┌─────────────────────────────────────────┐
│    Component State (NotificationList)    │
│  - Fetches on mount                      │
│  - Calls fetchNotifications(userId)      │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│  NotificationContext State               │
│  - notifications: Notification[]         │
│  - unreadCount: number                   │
│  - loading: boolean                      │
│                                          │
│  Functions:                              │
│  - addNotification()                     │
│  - fetchNotifications()                  │
│  - markAsRead()                          │
│  - markAllAsRead()                       │
│  - deleteNotif()                         │
│  - deleteAllNotif()                      │
│  - getUnreadCount()                      │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│   Service Layer                          │
│   (notificationService.ts)               │
│                                          │
│   Query Operations:                      │
│   - collection(db, 'notifications')      │
│   - where('userId', '==', userId)        │
│   - orderBy('createdAt', 'desc')         │
│                                          │
│   CRUD Operations:                       │
│   - addDoc()                             │
│   - getDocs()                            │
│   - updateDoc()                          │
│   - deleteDoc()                          │
└──────────────────┬──────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│   Firestore Database                    │
│   ┌────────────────────────────────┐    │
│   │   notifications collection      │    │
│   │   ├── {docId1}                  │    │
│   │   │   ├── userId                │    │
│   │   │   ├── ticketId              │    │
│   │   │   ├── message               │    │
│   │   │   ├── isRead                │    │
│   │   │   ├── targetPage            │    │
│   │   │   └── createdAt             │    │
│   │   │                             │    │
│   │   ├── {docId2}                  │    │
│   │   │   └── ...                   │    │
│   │   │                             │    │
│   │   └── {docIdN}                  │    │
│   │       └── ...                   │    │
│   └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## 🔌 Integration Points

### Point 1: Ticket Creation
```
User Creates Ticket
        ↓
Ticket Saved to Firestore
        ↓
Call: addNotification(studentId, ticketId, message)
        ↓
Notification Appears in NotificationList
```

### Point 2: Ticket Status Update
```
Admin Updates Status
        ↓
Status Updated in Firestore
        ↓
Call: addNotification(studentId, ticketId, newStatus)
        ↓
Student Sees Update in Notifications
```

### Point 3: Admin Response
```
Admin Submits Response
        ↓
Response Saved to Firestore
        ↓
Call: addNotification(studentId, ticketId, message)
        ↓
Student Notified of Response
```

---

## 🔄 Notification Lifecycle

```
CREATION
   │
   ├─ User/System triggers event
   │
   └─→ addNotification()
       ├─ Creates notification object
       ├─ Saves to Firestore
       └─ Updates local state
       
DISPLAY
   │
   ├─ NotificationList fetches data
   │
   └─→ fetchNotifications()
       ├─ Queries Firestore
       ├─ Orders by createdAt
       └─ Updates state
       
INTERACTION
   │
   ├─ User clicks "Mark as Read"
   │
   └─→ markAsRead()
       ├─ Updates Firestore
       ├─ Updates local state
       └─ Updates unreadCount
       
CLEANUP
   │
   ├─ User clicks Delete
   │
   └─→ deleteNotif()
       ├─ Deletes from Firestore
       ├─ Removes from state
       └─ Updates unreadCount
```

---

## 📱 UI Component Hierarchy

```
NotificationList
├── Header Section
│   ├── Title & Subtitle
│   └── "Mark All as Read" Button
│
└── Notifications Grid
    ├── NotificationItem [0]
    │   ├── Unread Indicator
    │   ├── Message Content
    │   ├── Timestamp
    │   └── Action Buttons
    │       ├── Mark as Read
    │       └── Delete
    │
    ├── NotificationItem [1]
    │   └── ...
    │
    └── NotificationItem [N]
        └── ...
```

---

## 🎨 Navigation Integration

```
App Navigation Structure (After Update)
│
├── Admin
│   ├── Dashboard
│   ├── Notifications ← NEW
│   ├── Ticket List
│   ├── User Management
│   ├── Form Editor
│   └── Archive
│
├── Class Rep
│   ├── Dashboard
│   ├── Notifications ← NEW
│   ├── Report Issue
│   ├── My Tickets
│   ├── Review Tickets
│   └── Archive
│
└── Student
    ├── Dashboard
    ├── Notifications ← NEW
    ├── Report Issue
    ├── My Tickets
    └── Archive
```

---

## 🔐 Security Flow

```
User Action
    ↓
getAuth().currentUser?.uid
    ↓
Check userId in context (useAuth)
    ↓
Pass userId to notification function
    ↓
Firestore: where('userId', '==', userId)
    ↓
Only return that user's notifications
    ↓
Display to user
```

---

## 📊 Data Structure

### Notification Object in Firestore
```
{
  id: "auto-generated-by-firebase",
  userId: "user-xyz-123",           // Current user
  ticketId: "ticket-abc-456",       // Related ticket
  message: "✅ Your ticket was created",  // Display message
  isRead: false,                    // Read status
  targetPage: "/tickets",           // Optional navigation
  createdAt: Timestamp(ms)          // For sorting
}
```

### Notification Object in Code
```typescript
interface Notification {
  id: string;
  userId: string;
  ticketId: string;
  message: string;
  isRead: boolean;
  targetPage?: string;
  createdAt: string;  // ISO string from Firestore
}
```

---

## 🔄 Request/Response Flow

### Creating Notification
```
Client Component
    ↓
useNotifications().addNotification(userId, ticketId, message)
    ↓
NotificationContext.addNotification()
    ↓
firebaseAddNotification(notificationService)
    ↓
addDoc(collection(db, 'notifications'), notification)
    ↓
Firestore Response: docRef
    ↓
setNotifications([...prev, newNotification])
    ↓
Component Re-renders with New Data
```

### Fetching Notifications
```
Client Component Mounts
    ↓
useEffect(() => { fetchNotifications(userId) })
    ↓
NotificationContext.fetchNotifications()
    ↓
getUserNotifications(userId) from service
    ↓
getDocs(query(notifications, where userId, orderBy createdAt))
    ↓
Firestore Response: QuerySnapshot
    ↓
Convert Timestamp to ISO string
    ↓
setNotifications(notificationsArray)
    ↓
Component Re-renders with Data
```

---

## ✨ Key Features Summary

```
┌─ FUNCTIONALITY ─────────────────────────────┐
│ ✅ Create notifications                     │
│ ✅ Read all user notifications              │
│ ✅ Mark single as read                      │
│ ✅ Mark all as read                         │
│ ✅ Delete single notification                │
│ ✅ Delete all notifications                  │
│ ✅ Track unread count                       │
│ ✅ Real-time state updates                  │
└─────────────────────────────────────────────┘

┌─ UI FEATURES ────────────────────────────────┐
│ ✅ Beautiful list display                   │
│ ✅ Unread count badge                       │
│ ✅ Mark as read buttons                     │
│ ✅ Delete buttons                           │
│ ✅ "Mark all as read" button               │
│ ✅ Relative timestamps                      │
│ ✅ Loading states                           │
│ ✅ Empty state message                      │
│ ✅ Dark mode support                        │
│ ✅ Responsive design                        │
└─────────────────────────────────────────────┘

┌─ INTEGRATION ────────────────────────────────┐
│ ✅ Global context provider                  │
│ ✅ Navigation items for all roles           │
│ ✅ Page in main routing                     │
│ ✅ Badge in header                          │
│ ✅ Firebase Firestore persistence           │
│ ✅ Type-safe with TypeScript                │
│ ✅ Error handling throughout                │
└─────────────────────────────────────────────┘
```

---

**This architecture ensures scalability, maintainability, and ease of integration with the rest of your CIRA application.**
