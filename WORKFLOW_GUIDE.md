# STEP-BY-STEP WORKFLOW GUIDE

## COMPLETE COMPLAINT LIFECYCLE

### STEP 1: USER FILES A COMPLAINT

**What the user does:**

1. Log in to the system
2. Click **"File New Complaint"** in the sidebar
3. Fill in the form:
   - **Title**: "Pothole on Main Street"
   - **Description**: "Large pothole causing damage to vehicles..."
   - **Category**: Can be left blank (AI will auto-detect) or select "Infrastructure"
   - **Priority**: Can be left blank (AI will auto-assign) or select based on urgency
   - **Location**: Click "Get Location" to capture GPS coordinates or type address
   - **Attachments**: Upload 1-5 images/videos showing the problem
4. Click **"Submit Complaint"**
5. ✅ Complaint is created and appears in "My Complaints"

**What happens behind the scenes:**
- System generates unique complaint ID
- AI analyzes title + description to auto-categorize if needed
- AI assigns priority if not selected
- System sets SLA deadline based on priority
- Notification is sent to admin
- Complaint appears on admin dashboard
- Socket.IO broadcasts to connected admins

---

### STEP 2: ADMIN REVIEWS & ASSIGNS

**What the admin does:**

1. Log in to the system
2. Go to **"All Complaints"**
3. See the new complaint from step 1
4. Click on the complaint to view details
5. Review:
   - Complaint description
   - Category and priority
   - Attached images
   - SLA deadline
6. Click **"Assign to Department"** (if not auto-assigned)
   - Select appropriate department
   - Select a staff member from that department
7. Click **"Confirm Assignment"**
8. ✅ Complaint is now "Assigned" status

**What the user sees:**
- Complaint status changes to "Assigned"
- Notification: "Your complaint has been assigned to [Department Name]"
- They can see which department is handling it

**What the staff member sees:**
- Complaint appears in **"My Assigned Complaints"**
- Notification: "New complaint assigned to you: [Title]"
- Can now click to view and work on it

---

### STEP 3: STAFF & USER COMMUNICATE VIA CHAT

**What staff does:**

1. Log in to the system
2. Go to **"My Assigned Complaints"**
3. Click on the complaint assigned in Step 2
4. Scroll to the **"Chat"** section at the bottom
5. Type a message: "We received your complaint. We'll inspect the site tomorrow."
6. Press Send
7. ✅ Message appears in chat

**What user sees:**

1. Log in to the system
2. Go to **"My Complaints"**
3. Click on their complaint
4. Scroll to the **"Chat"** section
5. See staff's message in real-time
6. Type a response: "Thank you! Please let me know when you're coming."
7. Press Send
8. ✅ Staff sees the response immediately

**Back and forth communication:**
- Staff: "We'll be there between 2-4 PM"
- User: "Perfect, I'll be home then"
- Staff: "Work completed! Check the photos we uploaded"
- User: "Great! Much safer now"

**This continues until complaint is resolved...**

---

### STEP 4: STAFF UPDATES STATUS & WORKS ON COMPLAINT

**What staff does:**

1. In the complaint details page, click **"Update Status"**
2. Select **"In Progress"**
3. Add comment: "Work started on pothole repair"
4. Click **"Update"**
5. ✅ Status changes to "In Progress"

**What user sees:**
- Complaint status badge changes to "In Progress"
- Timeline shows: "Work started on pothole repair"
- Notification: "Your complaint status has been updated to In Progress"

**Staff continues working and updating:**
- Takes photos of the work
- Communicates through chat with user
- Keeps them informed

---

### STEP 5: STAFF RESOLVES COMPLAINT

**What staff does:**

1. In the complaint details page, click **"Resolve Complaint"**
2. A modal opens with:
   - **Resolution Details**: "Pothole filled and repaired. Road resurfaced."
   - **Resolution Images**: Upload before/after photos
3. Click **"Mark as Resolved"**
4. ✅ Complaint status changes to "Resolved"

**What user sees:**
- Status changes to "Resolved"
- Timeline shows: "Complaint resolved"
- Can see resolution details
- Can see before/after photos
- New section appears: **"Rate Your Experience"**

---

### STEP 6: USER PROVIDES FEEDBACK

**What user does:**

1. Log in and go to their complaint
2. Scroll to **"Rate Your Experience"** section
3. Click on stars to rate (1-5):
   - ⭐ 5 stars: "Excellent service!"
4. Type a comment: "Staff was professional and fixed it quickly"
5. Click **"Submit Feedback"**
6. ✅ Feedback is submitted

**What staff and admin see:**
- Complaint now shows user's rating and comment
- Helps track department performance

---

### STEP 7: COMPLAINT CLOSES

**Automatic:**
- Complaint status changes to "Closed"
- Complaint is archived
- Still visible in user's complaint history but marked as closed

**System records:**
- Total time to resolve
- User satisfaction rating
- Department performance
- SLA compliance

---

## ROLE-BASED WORKFLOWS

### USER WORKFLOW
```
File Complaint 
    ↓
See in Dashboard 
    ↓
Click to view details 
    ↓
Chat with assigned staff 
    ↓
See staff updates 
    ↓
Complaint resolved 
    ↓
Rate experience 
    ↓
Close complaint
```

### STAFF WORKFLOW
```
See assigned complaints 
    ↓
Review complaint details 
    ↓
Chat with user about issue 
    ↓
Update status to "In Progress" 
    ↓
Work on the complaint 
    ↓
Upload photos as proof 
    ↓
Update status to "Resolved" 
    ↓
See user's feedback
```

### ADMIN WORKFLOW
```
See new complaint filed 
    ↓
Review complaint details 
    ↓
Assign to appropriate department 
    ↓
Assign to specific staff member 
    ↓
Monitor progress in dashboard 
    ↓
Check complaint resolution time 
    ↓
View user feedback & ratings 
    ↓
Manage departments based on workload
```

---

## REAL-TIME FEATURES

### Instant Notifications
- ✅ User files complaint → Admin notified immediately
- ✅ Staff gets assignment → Notification appears
- ✅ Chat message sent → Both parties see in real-time
- ✅ Status updated → Notification sent to user
- ✅ Complaint resolved → User gets notification

### Live Chat
- Messages appear instantly (no page refresh needed)
- Typing indicator shows when someone is typing
- Message timestamps for reference
- Separate chat threads per complaint

### Real-time Dashboard Updates
- Admin dashboard updates without refresh
- New complaints appear immediately
- Status changes reflected instantly

---

## EXAMPLE COMPLAINT JOURNEY

### DAY 1 - 10:00 AM
- **User**: Files complaint about broken streetlight
- **Admin**: Receives notification, assigns to Electrical Department
- **Staff Member**: Gets notification of assignment

### DAY 1 - 10:30 AM
- **Staff**: Sends chat message: "Received your complaint. We'll inspect today."
- **User**: Sees message and replies: "Thank you!"

### DAY 1 - 2:00 PM
- **Staff**: Updates status to "In Progress" with comment "Inspection completed"
- **User**: Sees status change notification

### DAY 1 - 4:00 PM
- **Staff**: Resolves complaint, uploads repair photos
- **Status**: Changes to "Resolved"
- **User**: Gets notification, can now rate experience

### DAY 1 - 4:15 PM
- **User**: Rates 5 stars, leaves comment: "Great job!"
- **Complaint**: Automatically closes after feedback

### Behind the Scenes
- ✅ SLA tracked: Resolved in 6 hours (well within 24-hour deadline for High priority)
- ✅ Department workload recorded
- ✅ User satisfaction metric recorded
- ✅ Complaint appears on heatmap for analysis

---

## MULTIPLE CHATS HAPPENING SIMULTANEOUSLY

### Example Scenario:

**Admin Portal:**
- Assigns 5 complaints to different staff members
- Monitors 10 ongoing complaints
- Reviews dashboards

**User 1's Chat:**
- User 1 ↔ Staff Member A discussing water supply issue
- Messages flowing in real-time

**User 2's Chat:**
- User 2 ↔ Staff Member B discussing traffic issue
- Independent conversation

**User 3's Chat:**
- User 3 ↔ Staff Member C discussing sanitation issue
- Another independent conversation

**Socket.IO Technology:**
- Manages all these conversations simultaneously
- Each user/staff pair has their own dedicated chat room
- Messages don't get mixed up
- Real-time delivery without page refresh

---

## WHAT HAPPENS IF COMPLAINT ISN'T RESOLVED IN TIME?

### SLA Violation:
- System tracks SLA deadline (24/48/72 hours based on priority)
- If deadline approaches:
  - Staff gets warning notification
  - Admin sees escalation alert
  - Complaint may be escalated to higher priority

### Auto-Escalation:
- High priority complaints escalated after 24 hours
- Medium priority escalated after 48 hours
- Admin notified to take action

---

## SUMMARY

✅ **Users** can file complaints and chat with staff
✅ **Staff** can view assigned complaints and resolve them with photo proof
✅ **Admins** can manage the entire system and assign work
✅ **Communication** happens in real-time through chat
✅ **Feedback** is collected for quality improvement
✅ **SLA** is tracked to ensure timely resolution
✅ **History** is maintained for future reference
