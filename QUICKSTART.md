# QUICK START GUIDE

## 🚀 STARTING THE APPLICATION

### Step 1: Start MongoDB
Ensure MongoDB is running on `localhost:27017`
```powershell
# If using MongoDB locally, start the service
# Windows: Services → MongoDB → Start
# Or via terminal: mongod
```

### Step 2: Start Backend
```powershell
cd g:\smart_complaint_management\backend
npm run dev
```

Expected output:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
📡 Socket.IO server initialized
```

### Step 3: Start Frontend
```powershell
cd g:\smart_complaint_management\frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 4: Open in Browser
Visit: `http://localhost:5173/`

---

## 👤 CREATE TEST ACCOUNTS

### Option 1: Register as User
1. Go to http://localhost:5173/register
2. Fill in:
   - Name: "John Doe"
   - Email: "user@example.com"
   - Password: "password123"
   - Phone: "1234567890"
   - Address: "123 Main St"
3. Click "Sign Up"
4. ✅ Account created, auto-logged in
5. You'll be on User Dashboard

---

### Option 2: Create Admin Account (via MongoDB)

**Using MongoDB Compass or CLI:**

```javascript
// Connect to smart_complaint_management database
// Insert into users collection:

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123", // Will be hashed by system
  "role": "admin",
  "phone": "1234567890",
  "address": "Admin Office",
  "isActive": true
}
```

Then login with: admin@example.com / admin123

---

### Option 3: Create Department Staff (via Admin Panel)

1. Login as Admin
2. Go to "Manage Users"
3. Click "Create New User"
4. Fill in form:
   - Name: "John Smith"
   - Email: "staff@example.com"
   - Password: "staff123"
   - Role: "department_staff"
5. Go to "Manage Departments"
6. Create a department or select existing
7. Add the staff member to the department
8. ✅ Staff account is ready

---

## 🎯 TEST THE COMPLETE WORKFLOW

### 1. File a Complaint (User)
1. Login as regular user
2. Click "File New Complaint"
3. Fill in:
   - Title: "Pothole on Main Street"
   - Description: "Large pothole damaging cars"
   - Category: (leave blank for AI to detect)
   - Priority: (leave blank for AI to assign)
   - Attachments: (optional - upload a photo)
4. Click "Submit Complaint"
5. ✅ Complaint appears in "My Complaints"

### 2. Assign Complaint (Admin)
1. Login as admin
2. Go to "All Complaints"
3. See your new complaint
4. Click on it
5. Click "Assign to Staff"
6. Select:
   - Department: (e.g., "Infrastructure")
   - Staff Member: "John Smith"
7. Click "Assign"
8. ✅ Staff will see it in their assigned complaints

### 3. Start Chat (User)
1. Login as user
2. Go to "My Complaints"
3. Click on your complaint
4. Scroll to "Chat" section
5. Type: "When will this be fixed?"
6. Press Send
7. Message appears immediately

### 4. Staff Responds (Staff)
1. Login as staff member
2. Go to "My Assigned Complaints"
3. Click on the complaint you were assigned
4. Scroll to "Chat" section
5. See user's message
6. Type: "We'll fix it tomorrow at 10 AM"
7. Press Send
8. ✅ User sees response in real-time

### 5. Update Status (Staff)
1. In complaint details, click "Update Status"
2. Select "In Progress"
3. Comment: "Repair work started"
4. Click "Update"
5. ✅ Status changes, user gets notification

### 6. Resolve Complaint (Staff)
1. In complaint details, click "Resolve Complaint"
2. Resolution Details: "Pothole filled and road resurfaced"
3. Upload images: (after/completion photos)
4. Click "Mark as Resolved"
5. ✅ Complaint is resolved

### 7. User Provides Feedback (User)
1. Login as user
2. Go to complaint details
3. Scroll to "Rate Your Experience"
4. Click 5 stars
5. Comment: "Great job! Fast service!"
6. Click "Submit Feedback"
7. ✅ Complaint closes automatically

### 8. Admin Views Results (Admin)
1. Login as admin
2. Dashboard shows updated statistics
3. Go to "All Complaints"
4. See complaint marked as "Closed"
5. Check "Complaints Heatmap" to see location data
6. ✅ View performance metrics

---

## 🧪 TEST FEATURES

### Chat Feature
- File 2 different complaints
- Open both in separate tabs
- Chat from user tab
- Switch to staff tab and see message
- Reply from staff tab
- Switch to user tab and see reply
- ✅ Real-time, no refresh needed

### AI Processing
- File complaint without selecting category/priority
- Check complaint details
- See AI-assigned category and priority
- ✅ AI worked successfully

### Location Tracking
- File complaint with location
- Click "Get Location" (allows browser to access GPS)
- Location coordinates appear
- Submit complaint
- Admin → Heatmap → See complaint location
- ✅ Geolocation working

### SLA Tracking
- File HIGH priority complaint
- Check complaint details
- See SLA deadline = 24 hours from now
- ✅ SLA properly calculated

### File Uploads
- File complaint with attachments
- Upload 1-5 images
- Submit complaint
- View complaint details
- See images displayed
- ✅ File handling working

---

## 🐛 COMMON ISSUES & SOLUTIONS

### "Cannot connect to MongoDB"
- ✅ Ensure MongoDB is running
- ✅ Check connection string in .env is correct
- ✅ Default: `mongodb://localhost:27017/smart_complaint_management`

### "Port 5000 already in use"
- ✅ Kill existing process: `netstat -ano | findstr :5000`
- ✅ Then: `taskkill /PID <PID> /F`
- ✅ Or change PORT in .env

### "Messages not showing in chat"
- ✅ Ensure both users have joined the complaint
- ✅ Check Socket.IO is initialized
- ✅ Refresh page and try again

### "Images not displaying"
- ✅ Check file path is correct
- ✅ Ensure uploads folder exists: `backend/uploads/`
- ✅ Verify backend is serving static files

### "Can't assign complaint to staff"
- ✅ Ensure staff member is added to a department
- ✅ Refresh page after adding staff to department
- ✅ Staff member must have role: "department_staff"

---

## 📊 VERIFY EVERYTHING WORKS

### Checklist:
- ✅ Backend starts without errors
- ✅ Frontend loads on http://localhost:5173
- ✅ Can register new user
- ✅ Can login as user
- ✅ User dashboard shows statistics
- ✅ Can file a complaint
- ✅ Complaint appears in "My Complaints"
- ✅ Admin can see complaint in "All Complaints"
- ✅ Admin can assign complaint to staff
- ✅ Staff can see assigned complaint
- ✅ Chat works both ways
- ✅ Status updates appear
- ✅ Staff can resolve with images
- ✅ User can rate experience
- ✅ Admin dashboard shows metrics

If all ✅, system is **fully operational**!

---

## 📚 DOCUMENTATION

For more details, see:
- **FEATURES_GUIDE.md** - All system features
- **WORKFLOW_GUIDE.md** - Complete workflow examples
- **IMPLEMENTATION_SUMMARY.md** - Technical details

---

## 🆘 NEED HELP?

Check these files in order:
1. Terminal for error messages
2. Browser console (F12 → Console tab)
3. Network tab (F12 → Network) for failed requests
4. Backend logs for API errors

Copy any error messages and they can be debugged!
