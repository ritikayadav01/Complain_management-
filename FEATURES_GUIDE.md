# Smart Complaint Management System - Features Guide

## System Overview

The Smart Complaint Management System has three main user roles with different capabilities:

---

## 1. REGULAR USER (Citizen)

### What Users Can Do:

#### Dashboard
- View your complaint statistics:
  - Total complaints filed
  - Pending complaints
  - Resolved complaints
  - Resolution rate percentage
- See 5 most recent complaints at a glance

#### File New Complaint
- Create a new complaint with:
  - **Title** (required) - brief summary of the issue
  - **Description** (required) - detailed explanation
  - **Category** (optional) - auto-detected by AI if not selected
    - Infrastructure
    - Sanitation
    - Water Supply
    - Electricity
    - Traffic
    - Waste Management
    - Parks
    - Security
    - Other
  - **Priority** (optional) - auto-assigned by AI if not selected
    - Low (72 hours to resolve)
    - Medium (48 hours to resolve)
    - High (24 hours to resolve)
  - **Location** (optional) - can use "Get Location" to capture GPS coordinates
  - **Attachments** (optional) - upload up to 5 images or videos as evidence

#### My Complaints
- View all your filed complaints
- Filter and sort by status, date, priority
- Click any complaint to view full details

#### Complaint Details & Chat
- View full complaint information:
  - Current status
  - Priority level
  - Department assigned
  - Timeline of all updates
  - Attached images/videos
- **Chat with staff members**:
  - Send and receive real-time messages
  - Discuss your complaint with assigned department staff
  - Get updates and ask questions
- Submit feedback when complaint is resolved:
  - Rate your experience (1-5 stars)
  - Leave comments

---

## 2. DEPARTMENT STAFF

### What Staff Can Do:

#### Dashboard
- View assigned complaints statistics
- See workload information
- Quick access to assigned complaints

#### My Assigned Complaints
- View complaints assigned to your department
- See complaint status, priority, and details
- Click to view full complaint details

#### Complaint Details & Actions
- View complete complaint information
- **Real-time chat with users**:
  - Send and receive messages
  - Provide updates and assistance
  - Answer user questions
- **Update Status**:
  - Mark as "In Progress" when you start working
  - Provide status update comments
- **Resolve Complaint**:
  - Add resolution details explaining how it was fixed
  - Upload before/after photos as proof
  - Mark complaint as resolved

---

## 3. ADMIN

### What Admins Can Do:

#### Dashboard
- See system-wide statistics:
  - Total complaints
  - Open/pending/resolved counts
  - Department workload
  - Performance metrics

#### All Complaints
- View every complaint in the system
- Filter by:
  - Status (submitted, reviewed, assigned, in progress, resolved, closed)
  - Category
  - Priority
  - Department
  - Staff member
- Assign complaints to departments and staff members
- Monitor complaint progress

#### Manage Departments
- Create new departments
- Assign department heads
- Add/remove staff members from departments
- Set contact information
- Enable/disable departments

#### Manage Users
- View all system users
- Create new user accounts
- Modify user roles:
  - User (regular citizen)
  - Admin (system administrator)
  - Department_staff (department employee)
- Deactivate user accounts
- View user statistics

#### Complaints Heatmap
- Visual map showing:
  - Distribution of complaints by location
  - Complaint density in different areas
  - Category breakdown by region
- Helps identify problem areas for planning

---

## COMMUNICATION FLOW

### How Chat Works:

1. **User files complaint**
   - User creates a complaint and submits it

2. **Admin reviews and assigns**
   - Admin reviews the complaint
   - Assigns it to appropriate department/staff

3. **Real-time conversation starts**
   - Both user and staff can:
     - Send messages in real-time
     - Share updates and information
     - Ask clarification questions
     - Receive instant notifications

4. **Staff resolves**
   - Staff member works on the complaint
   - Updates status to "In Progress"
   - Chats with user about progress
   - Uploads resolution images when done
   - Marks as "Resolved"

5. **User provides feedback**
   - User rates the experience
   - Leaves comments
   - Complaint closes

---

## KEY FEATURES

### AI Processing
- Automatically categorizes complaints based on description
- Auto-assigns priority levels (High/Medium/Low)
- Routes to appropriate department

### SLA Management
- **Low Priority**: 72 hours to resolve
- **Medium Priority**: 48 hours to resolve
- **High Priority**: 24 hours to resolve
- System tracks and alerts on approaching deadlines

### Real-time Updates
- Socket.IO integration for instant messaging
- Live complaint status updates
- Notification system for all activities

### Geolocation
- Capture complaint location via GPS
- View complaints on heatmap
- Identify problem areas

### File Management
- Upload and view images/videos
- Before/after proof of resolution
- Attachment tracking

---

## HOW TO GET STARTED

### For Users:
1. Register an account
2. Go to Dashboard
3. Click "File New Complaint"
4. Fill in details and submit
5. View complaint details and chat with assigned staff
6. Provide feedback when resolved

### For Department Staff:
1. Wait for admin to assign you to a department
2. Login with your credentials
3. Go to "My Assigned Complaints"
4. Click on a complaint to view details
5. Chat with the user
6. Update status and resolve when done

### For Admins:
1. Login with admin credentials
2. View system statistics on Dashboard
3. Review complaints and assign to departments
4. Create departments and manage staff
5. Monitor system performance

---

## NAVIGATION MENU

### User Menu:
- 🏠 Dashboard - View your statistics and recent complaints
- ➕ File New Complaint - Create a new complaint
- 📋 My Complaints - View all your complaints

### Staff Menu:
- 🏠 Dashboard - View your dashboard
- ✅ My Assigned Complaints - View complaints assigned to you

### Admin Menu:
- 📊 Dashboard - View system statistics
- 📄 All Complaints - View and manage all complaints
- ⚙️ Manage Departments - Create and manage departments
- 👥 Manage Users - Create and manage user accounts
- 🗺️ Complaints Heatmap - View complaint distribution map

---

## SUPPORT & HELP

If you encounter any issues:
1. Check the error message displayed
2. Ensure you have stable internet connection
3. Try refreshing the page
4. Contact your system administrator
