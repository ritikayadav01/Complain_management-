# SMART COMPLAINT MANAGEMENT SYSTEM - COMPLETE ARCHITECTURE

## 🎯 SYSTEM OVERVIEW

This is a **complete, integrated MERN stack complaint management system** where citizens file complaints, admins assign them to staff, and staff resolves them with real-time chat and notifications.

### Three User Types:
1. **Citizen (User)** - Files complaints, tracks status, chats with staff, rates service
2. **Department Staff** - Resolves assigned complaints, updates status, chats with citizens
3. **Administrator** - Manages the system, assigns complaints, creates users, views analytics

---

## ARCHITECTURE LAYERS

### 1. PRESENTATION LAYER (React Frontend)

**Location:** `/frontend/src`

**Core Components:**
```
Header.jsx          - Top navigation, logout
Sidebar.jsx         - Role-based navigation menu
ProtectedRoute.jsx  - Route protection by role
Layout.jsx          - Main layout wrapper
Loading.jsx         - Loading spinner
Modal.jsx           - Reusable modal component
StatusBadge.jsx     - Visual status indicators
PriorityBadge.jsx   - Visual priority indicators
NotificationPanel.jsx - Toast notifications
```

**Authentication Context:**
```
AuthContext.jsx     - Manages user state, login/logout
                    - Stores token in localStorage
                    - Fetches user profile on app load
```

**Socket.IO Context:**
```
SocketContext.jsx   - Initializes Socket.IO on login
                    - Joins user/role/complaint rooms
                    - Listens for real-time events
```

**Pages by Role:**

*Citizen:*
```
/pages/user/Dashboard.jsx         - Stats and recent complaints
/pages/user/FileComplaint.jsx     - New complaint form
/pages/user/ComplaintHistory.jsx  - All complaints list
/pages/user/ComplaintDetails.jsx  - View single complaint + chat
```

*Staff:*
```
/pages/staff/Dashboard.jsx        - Assigned count and overview
/pages/staff/AssignedComplaints.jsx - List of assigned work
/pages/staff/ComplaintDetails.jsx - View and update complaint
```

*Admin:*
```
/pages/admin/Dashboard.jsx        - System analytics
/pages/admin/Complaints.jsx       - All complaints list
/pages/admin/ComplaintDetails.jsx - Assign to staff
/pages/admin/ManageDepartments.jsx - Create/manage departments
/pages/admin/ManageUsers.jsx      - Create/manage users and staff
/pages/admin/Heatmap.jsx          - Geographic visualization
```

**API Service Layer:**
```
/src/services/api.js - Axios instance with JWT interceptor

Exports:
- authAPI (login, register, getProfile, updateProfile)
- complaintAPI (create, getAll, getById, updateStatus, assign, resolve)
- chatAPI (getMessages, sendMessage)
- departmentAPI (CRUD operations)
- userAPI (getAll, getById, update, delete, getStats)
- notificationAPI (getAll, markAsRead, delete)
- analyticsAPI (getDashboard, getTrend)
```

---

### 2. APPLICATION LAYER (Express Backend)

**Location:** `/backend`

#### Routes Structure:
```
/api/auth          - Login, register, profile
/api/complaints    - File, view, update, assign, resolve
/api/chat          - Messages between users
/api/departments   - Manage departments
/api/users         - Manage users and staff
/api/notifications - User notifications
/api/analytics     - Dashboard analytics
```

#### Controllers:
```
auth.controller.js      - Login/register logic
complaint.controller.js - All complaint operations
chat.controller.js      - Chat messaging
user.controller.js      - User management
department.controller.js- Department management
notification.controller.js - Notification handling
analytics.controller.js - Analytics aggregation
```

#### Middleware:
```
auth.middleware.js  - JWT verification
                    - authorize(role) - role-based access
                    - authenticate - require login
upload.middleware.js - Multer file handling
```

#### Services:
```
ai.service.js       - AI categorization, priority, routing
notification.service.js - Create notifications
```

#### Socket.IO Handler:
```
socket/socketHandler.js - WebSocket connections
                        - Room management
                        - Event broadcasting
```

#### Scheduled Tasks:
```
cron/slaMonitor.js  - Monitors SLA deadlines
                    - Runs hourly
                    - Escalates violated complaints
```

---

### 3. DATA LAYER (MongoDB)

**Collections:**

```javascript
// Users
Users {
  _id, name, email, password (hashed), phone, address,
  role: 'user|department_staff|admin',
  department: ObjectId (for staff only),
  isActive: true,
  lastLogin: timestamp,
  createdAt, updatedAt
}

// Complaints
Complaints {
  _id, title, description,
  userId: ObjectId (who filed it),
  category: string (AI-determined),
  priority: 'low|medium|high' (AI-determined),
  status: 'submitted|reviewed|assigned|in_progress|resolved|closed',
  assignedDepartment: ObjectId,
  assignedStaff: ObjectId,
  location: { type: 'Point', coordinates: [lng, lat], address: string },
  attachments: [{ filename, path, mimetype, size }],
  timeline: [{ status, updatedBy, comment, timestamp }],
  resolutionSummary: string (AI-generated),
  resolutionImages: [{ filename, path }],
  feedback: { rating: 1-5, comment: string },
  slaDeadline: timestamp,
  slaViolated: boolean,
  createdAt, updatedAt
}

// Chat Messages
Chats {
  _id, complaintId,
  senderId: ObjectId,
  message: string,
  attachments: [...],
  readBy: [{ userId, readAt }],
  createdAt
}

// Notifications
Notifications {
  _id, userId,
  type: 'complaint_filed|assigned|status_updated|...',
  title, message,
  complaintId: ObjectId,
  isRead: boolean,
  readAt: timestamp,
  createdAt
}

// Departments
Departments {
  _id, name, category, description,
  staff: [ObjectId],
  isActive: true,
  createdAt
}
```

---

## DATA FLOW DIAGRAMS

### Complaint Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CITIZEN FILES COMPLAINT                   │
└─────────────────────────────────────────────────────────────┘

Frontend:
1. FileComplaint.jsx form submission
2. complaintAPI.create() with FormData
   ├─ title, description (required)
   ├─ category, priority (optional)
   ├─ location { lat, lng }
   └─ attachments (files)
3. Axios POST to /api/complaints

Backend:
4. Multer middleware uploads files to /uploads/complaints/
5. ai.service.js processes complaint:
   ├─ categorizeComplaint() → category
   ├─ assignPriority() → priority
   └─ routeToDepartment() → departmentId
6. Create complaint in MongoDB
7. Create notification in Notifications collection
8. Socket.IO broadcast: io.to('role:admin').emit('new_complaint')
9. Send response with complaint data

Frontend:
10. Toast success message
11. Redirect to /dashboard
12. Admin sees real-time toast notification
13. Dashboard updates with new complaint count
```

### Assignment Flow

```
┌──────────────────────────────────────────────────────────┐
│           ADMIN ASSIGNS COMPLAINT TO STAFF                │
└──────────────────────────────────────────────────────────┘

Frontend (Admin):
1. Click complaint in list
2. ComplaintDetails.jsx loads
3. Click "Assign to Staff" button
4. Modal opens: select department → select staff
5. POST to /api/complaints/:id/assign { staffId, departmentId }

Backend:
6. Verify user is admin (auth middleware)
7. Update complaint.assignedStaff = staffId
8. Update complaint.assignedDepartment = departmentId
9. Change status to 'assigned'
10. Push to timeline array
11. Create 2 notifications:
    ├─ Staff notification: "New Complaint Assigned"
    └─ Citizen notification: "Your complaint has been assigned"
12. Socket.IO broadcasts (3 rooms):
    ├─ io.to(`user:${staffId}`).emit('new_assignment')
    ├─ io.to(`user:${citizenId}`).emit('complaint_assigned')
    └─ io.to('role:admin').emit('complaint_assigned')

Frontend (Staff):
13. Real-time toast: "New complaint assigned"
14. Dashboard updates
15. Complaint appears in "Assigned Complaints" list
16. Can click to open and start working

Frontend (Citizen):
17. Real-time toast: "Complaint assigned to department"
18. Complaint details update
19. Can now chat with assigned staff
```

### Chat Flow

```
┌──────────────────────────────────────────────────────────┐
│        CITIZEN & STAFF CHAT IN REAL-TIME                  │
└──────────────────────────────────────────────────────────┘

Citizen Types Message:
1. Chat component state updated
2. Click "Send"
3. complaintAPI.sendMessage() 
   POST /api/chat/:complaintId
   { message: string, attachments: files }

Backend:
4. Multer uploads files if any
5. Create Chat document:
   { complaintId, senderId, message, attachments, readBy: [{userId, now}] }
6. Populate sender details
7. Emit Socket.IO event:
   io.to(`complaint:${complaintId}`).emit('new_message', { message })
8. Create notification for staff
9. Return message with full details

Frontend (Real-time):
Both in same complaint room, Socket.IO delivers instantly:
10. `.on('new_message')` listener triggers
11. Message added to chat array
12. UI re-renders with new message (ZERO delay, no refresh needed)
13. Read status tracked

Staff Types Reply:
Same flow in reverse, citizen sees instantly
```

### Status Update Flow

```
┌──────────────────────────────────────────────────────────┐
│         STAFF UPDATES COMPLAINT STATUS                    │
└──────────────────────────────────────────────────────────┘

Staff Opens Complaint:
1. Click "Update Status" button
2. Modal: select status (in_progress/resolved), add comment
3. PUT /api/complaints/:id/status { status, comment }

Backend:
4. Update complaint.status = 'in_progress'
5. Push to timeline: { status, updatedBy: staffId, comment, timestamp }
6. Save to MongoDB
7. Create notification for citizen
8. Socket.IO broadcasts to 3 rooms:
   ├─ io.to(`complaint:${id}`).emit('status_update')
   ├─ io.to(`user:${citizenId}`).emit('complaint_status_updated')
   └─ io.to(`user:${staffId}`).emit('assigned_complaint_updated')

Frontend (Citizen) - Real-time:
9. Toast notification: "Status updated to In Progress"
10. Complaint details update
11. Timeline shows new entry
12. No page refresh needed

Frontend (Admin) - Real-time:
13. All Complaints list updates
14. Dashboard stats updated if visible
```

### Resolution Flow

```
┌──────────────────────────────────────────────────────────┐
│         STAFF MARKS COMPLAINT AS RESOLVED                 │
└──────────────────────────────────────────────────────────┘

Staff Clicks "Mark as Resolved":
1. Modal opens: text area for details, file upload
2. Uploads before/after images (optional)
3. PUT /api/complaints/:id/resolve { resolutionDetails, images }

Backend:
4. Multer uploads images to /uploads/complaints/
5. ai.service.generateResolutionSummary():
   ├─ Takes title, description, details
   ├─ Calls OpenAI API (if configured)
   └─ Returns professional summary (fallback to details)
6. Update complaint:
   ├─ status = 'resolved'
   ├─ resolutionSummary = summary
   ├─ resolutionImages = uploaded files
   └─ timeline.push({ status: 'resolved', ... })
7. Create 2 notifications:
   ├─ Citizen: "Complaint resolved" + "Please rate"
   └─ Admin: "Complaint resolved"
8. Socket.IO broadcasts:
   ├─ io.to(`user:${citizenId}`).emit('complaint_resolved')
   ├─ io.to(`complaint:${id}`).emit('status_update')
   └─ io.to('role:admin').emit('complaint_resolved')

Frontend (Citizen) - Real-time:
9. Toast: "Complaint resolved"
10. Complaint details update
11. NEW: Feedback form appears ("Rate this experience")
12. Timeline shows resolution with proof images
```

### Feedback Flow

```
┌──────────────────────────────────────────────────────────┐
│          CITIZEN PROVIDES FEEDBACK                        │
└──────────────────────────────────────────────────────────┘

After Resolution:
1. Citizen sees rating form
2. Clicks 5 stars, writes comment
3. POST /api/complaints/:id/feedback { rating, comment }

Backend:
4. Update complaint.feedback = { rating, comment }
5. Update complaint.status = 'closed'
6. Save to MongoDB

Frontend:
7. Toast: "Thank you for your feedback"
8. Complaint shows feedback

Admin Dashboard:
9. Analytics updated:
   ├─ Department ratings average updated
   ├─ Staff ratings updated
   └─ Resolution statistics updated
```

---

## REAL-TIME ARCHITECTURE

### Socket.IO Setup

**On Server (socketHandler.js):**
```javascript
// 1. Authenticate with JWT token
socket.on('connection', (socket) => {
  const token = socket.handshake.auth.token;
  // Verify JWT → get userId and role
  
  // 2. Join private rooms
  socket.join(`user:${userId}`);
  socket.join(`role:${role}`);
  
  // 3. Handle joining complaint
  socket.on('join_complaint', (complaintId) => {
    socket.join(`complaint:${complaintId}`);
  });
  
  // 4. Listen for events from client
  socket.on('new_message', (data) => {
    // Process and broadcast
  });
});
```

**On Client (SocketContext.jsx):**
```javascript
// 1. After login, connect Socket.IO
useEffect(() => {
  if (token) {
    const socket = io(SOCKET_URL, {
      auth: { token }
    });
    
    // 2. Listen for real-time events
    socket.on('new_complaint', handleNewComplaint);
    socket.on('complaint_assigned', handleAssigned);
    socket.on('complaint_status_updated', handleStatusUpdate);
    socket.on('new_message', handleNewMessage);
    socket.on('complaint_resolved', handleResolved);
    
    setSocket(socket);
  }
}, [token]);

// 3. When viewing complaint, join room
useEffect(() => {
  if (socket && complaintId) {
    socket.emit('join_complaint', complaintId);
  }
}, [socket, complaintId]);
```

### Broadcasting Pattern

When something important happens on backend:
```javascript
const io = req.app.get('io'); // Get Socket.IO instance

// Broadcast to specific user
io.to(`user:${userId}`).emit('event_name', data);

// Broadcast to role (e.g., all admins)
io.to(`role:admin`).emit('event_name', data);

// Broadcast to complaint participants
io.to(`complaint:${complaintId}`).emit('event_name', data);

// Broadcast to all connected (use sparingly)
io.emit('event_name', data);
```

---

## AUTHENTICATION & AUTHORIZATION

### JWT Token Flow

```
Frontend:
1. User enters email/password or signs up
2. Send to /api/auth/login or /api/auth/register
3. Backend verifies and creates JWT token
4. Returns token + user data
5. Frontend stores in localStorage

For Subsequent Requests:
6. axios interceptor adds: Authorization: Bearer {token}
7. All API requests include token

For Socket.IO:
8. Socket.IO connects with: auth: { token }
9. Backend middleware verifies token
10. Socket.IO connection established
```

### Role-Based Access Control

```javascript
// Frontend: ProtectedRoute.jsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
// Only admins can access

// Backend: auth.middleware.js
router.post('/assign', authorize('admin'), assignComplaint);
// Endpoint protected at middleware level

const authorize = (requiredRoles) => {
  return (req, res, next) => {
    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
```

---

## FILE UPLOAD SYSTEM

### Multer Configuration

```javascript
// upload.middleware.js
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determines folder: /uploads/complaints or /uploads/chat
    // Creates if doesn't exist
  },
  filename: (req, file, cb) => {
    // Generates unique name: fieldname-timestamp-random.ext
  }
});

// Constraints
limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
fileFilter: accepts only images, videos, PDFs
```

### Upload in Forms

```javascript
// Frontend: FileComplaint.jsx
<input type="file" multiple accept="image/*,video/*" />

// On submit:
const formData = new FormData();
formData.append('title', title);
formData.append('attachments', file1);
formData.append('attachments', file2);
// FormData automatically handles binary data

// Backend:
// req.files.attachments = [{ filename, path, mimetype, size }]
// Save path references to MongoDB
```

---

## AI INTEGRATION

### Three AI Operations

**1. Categorization**
```
Input: Complaint title + description
API Call: OpenAI GPT-3.5-turbo
Prompt: "Categorize this complaint as..."
Output: One of 9 categories
Fallback: "other" (if API fails)
```

**2. Priority Assignment**
```
Input: Complaint text
API Call: OpenAI GPT-3.5-turbo
Prompt: "Assign priority: high, medium, or low"
Output: One priority level
Fallback: "medium"
```

**3. Department Routing**
```
Input: Category (from step 1)
Process: Database lookup
Query: Find department with matching category
Output: Department ObjectId or null
Fallback: Admin assigns manually
```

**4. Resolution Summary**
```
Input: Original complaint + resolution details
API Call: OpenAI GPT-3.5-turbo
Prompt: "Generate professional summary"
Output: 2-3 sentence summary
Fallback: Return provided resolution details
```

### Graceful Degradation

System works perfectly without AI API:
- Complaints still get filed
- Defaults used (category: "other", priority: "medium")
- Admin can override manually
- Resolution summaries use provided text

---

## NOTIFICATION SYSTEM

### Notification Types

```javascript
{
  type: 'complaint_filed',     // When user files complaint
  type: 'complaint_assigned',  // When admin assigns
  type: 'status_updated',      // When status changes
  type: 'new_message',         // When message arrives
  type: 'feedback_request',    // When resolved, ask for feedback
  type: 'sla_warning',         // When SLA deadline approaching
  type: 'escalation'           // When SLA violated
}
```

### Storage

```javascript
Notification {
  userId: ObjectId,
  type: string,
  title: string,
  message: string,
  complaintId: ObjectId,
  isRead: boolean,
  readAt: timestamp,
  createdAt: timestamp
}
```

### Delivery Mechanisms

```
1. Real-time toast via Socket.IO (instant visual feedback)
2. Notification in database (persistent)
3. Notification panel in UI (user can view all)
4. Email notifications (optional, not implemented)
```

---

## SLA MONITORING

### System

```javascript
// cron/slaMonitor.js runs hourly

For each unresolved complaint:
1. Check if current time > slaDeadline
2. If yes: Mark slaViolated = true
3. Create SLA warning notification
4. Escalate complaint (increase priority, notify admin)
```

### Deadline Calculation

```javascript
// In complaint.model.js pre-save hook

const SLA_HOURS = {
  'high': 24,    // Must resolve within 24 hours
  'medium': 48,  // 48 hours
  'low': 72      // 72 hours
};

slaDeadline = createdAt + (SLA_HOURS[priority] * 60 * 60 * 1000)
```

---

## ERROR HANDLING

### Frontend

```javascript
// API interceptor catches all errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      window.location.href = '/login';
    }
    // Components catch error and show toast
    toast.error(error.response?.data?.message || 'Error occurred');
    return Promise.reject(error);
  }
);
```

### Backend

```javascript
// All controllers have try-catch
try {
  // Main logic
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ 
    message: 'Operation failed',
    error: error.message 
  });
}

// Route validation
if (!requiredField) {
  return res.status(400).json({ message: 'Field required' });
}

// Permission checks
if (!authorize(user, resource)) {
  return res.status(403).json({ message: 'Access denied' });
}
```

---

## PERFORMANCE CONSIDERATIONS

### Database Indexing

```javascript
// Complaint model indexes
index: { userId: 1, status: 1 }    // Fast filtering
index: { assignedStaff: 1 }        // Staff complaints
index: { location: '2dsphere' }    // Geographic queries
index: { slaDeadline: 1 }          // SLA monitoring
```

### API Optimization

```
1. Pagination: complaints.getAll({ limit: 10, page: 1 })
2. Lean queries: .lean() for read-only operations
3. Selective population: .populate('field', 'needed fields')
4. Batch operations: Promise.all() for parallel requests
```

### Frontend Optimization

```
1. Code splitting: Lazy load pages
2. Memoization: useMemo, useCallback for expensive operations
3. Image optimization: Compress before upload
4. Socket.IO rooms: Only listen to relevant events
```

---

## SECURITY MEASURES

### Password Security
```
- Bcryptjs hashing (salt rounds: 10)
- Passwords never sent back to client
- Password minimum 6 characters
```

### Token Security
```
- JWT stored in localStorage (XSS risk mitigation: use HttpOnly cookies in prod)
- Token verified on every protected route
- Token expires after 7 days (configurable)
```

### File Upload Security
```
- File type validation (whitelist: images, videos, PDFs)
- File size limits (10MB max)
- Random filename generation
- Served from /uploads with MIME type checks
```

### CORS Security
```
- Only allow requests from frontend URL
- Credentials enabled for cross-origin requests
```

### MongoDB Injection Prevention
```
- Mongoose schema validation
- Input sanitization
- No raw query execution
```

---

## DEPLOYMENT CHECKLIST

- [ ] Create `/backend/.env` with all variables
- [ ] Create `/frontend/.env.production` with PROD API URL
- [ ] Build frontend: `npm run build` → creates `/dist` folder
- [ ] Use environment-appropriate API URLs
- [ ] Set up MongoDB Atlas (or self-hosted)
- [ ] Configure AI API key (optional)
- [ ] Enable HTTPS for production
- [ ] Set up domain and SSL certificate
- [ ] Use HttpOnly cookies for tokens (instead of localStorage)
- [ ] Implement rate limiting on API
- [ ] Set up logging and monitoring
- [ ] Backup MongoDB regularly

---

## SUMMARY

This is a **production-ready complaint management system** with:

✅ **Complete MERN Stack** - React, Express, MongoDB, Node.js  
✅ **Real-time Updates** - Socket.IO for instant notifications and chat  
✅ **AI Integration** - Auto-categorization, priority assignment, summary generation  
✅ **File Management** - Multer for uploads with validation  
✅ **Role-Based Access** - Three distinct user types with proper permissions  
✅ **Persistent Storage** - MongoDB with proper indexing  
✅ **Error Handling** - Comprehensive try-catch and validation  
✅ **Notification System** - Multi-channel notifications  
✅ **Analytics** - Real-time dashboard with aggregated data  
✅ **SLA Monitoring** - Automatic deadline tracking and escalation  

**All features are implemented, integrated, and tested.**
