# Account Creation & Login Guide

## THREE DIFFERENT ACCOUNT TYPES

The system has three distinct user roles, each with different creation mechanisms:

---

## 1. REGULAR USER (Citizen) - PUBLIC REGISTRATION

### Who Can Create: Anyone
### How to Create:
1. Go to Login page: http://localhost:5173/login
2. Click **"Sign up"** link
3. Fill in registration form:
   - Full Name
   - Email
   - Phone (optional)
   - Address (optional)
   - Password (minimum 6 characters)
4. Click **"Sign Up"**
5. ✅ Account created immediately
6. Auto-logged in and redirected to User Dashboard

### What They Can Do:
- File complaints
- View complaint history
- Chat with assigned staff
- Rate experience
- Track complaint status

### How They Log In:
- Email + Password on login page

### Example:
```
Name: John Doe
Email: citizen@example.com
Password: citizen123
```

---

## 2. DEPARTMENT STAFF - ADMIN CREATION ONLY

### Who Can Create: Admin only
### How to Create:

**Step 1: Admin logs in**
- Navigate to "Manage Users"
- Click **"Create New User"** button

**Step 2: Select Role**
- Choose: "Department Staff Member"
- Description shows: "Can handle assigned complaints and chat with users"

**Step 3: Fill in Details**
- Full Name: "Jane Smith"
- Email: "jane.smith@gov.com"
- Password: "staff123456"
- Phone: (optional)
- Address: (optional)
- **Department: REQUIRED** (select from dropdown)

**Step 4: Create Account**
- Click **"Create Account"**
- ✅ Account created
- Staff can now log in immediately

### What They Can Do:
- View assigned complaints
- Chat with users
- Update complaint status
- Resolve complaints with photos
- See user feedback

### How They Log In:
- Email + Password on login page
- Auto-redirected to Staff Dashboard

### Example:
```
Name: Jane Smith
Email: jane.smith@infrastructure.com
Password: staff123456
Department: Infrastructure
```

---

## 3. ADMINISTRATOR - ADMIN CREATION ONLY

### Who Can Create: Existing Admin only
### How to Create:

**Step 1: Admin logs in**
- Navigate to "Manage Users"
- Click **"Create New User"** button

**Step 2: Select Role**
- Choose: "Administrator"
- Description shows: "Can manage system, departments, users, and complaints"

**Step 3: Fill in Details**
- Full Name: "Admin Officer"
- Email: "admin2@system.com"
- Password: "admin123456"
- Phone: (optional)
- Address: (optional)
- Department: **NOT REQUIRED** (skipped for admins)

**Step 4: Create Account**
- Click **"Create Account"**
- ✅ Account created
- Admin can now log in immediately

### What They Can Do:
- View all complaints in system
- Assign complaints to staff
- Manage departments
- Create/manage users
- View system analytics
- View complaint heatmap
- Manage SLA settings

### How They Log In:
- Email + Password on login page
- Auto-redirected to Admin Dashboard

### Example:
```
Name: System Admin
Email: system.admin@gov.com
Password: admin123456
```

---

## ACCOUNT CREATION FLOW DIAGRAM

```
NEW PERSON ARRIVES
        ↓
    ┌───┴────┬─────────┬─────────┐
    │         │         │         │
   User     Staff      Admin     (No Account)
    │         │         │             │
    ↓         ↓         ↓             ↓
  PUBLIC    ADMIN      ADMIN        ERROR
   REG      CREATES    CREATES       (Can't
    ↓       (Manage    (Manage      Login)
    ↓       Users)     Users)
    ↓         ↓         ↓
 Auto-     Need Pass   Need Pass
 Login     from Admin  from Admin
 & Dash    to Login    to Login
```

---

## DETAILED ACCOUNT CREATION STEPS

### PUBLIC USER REGISTRATION

**Location:** Login Page → Sign Up Link
**Who:** Anyone (no authentication required)
**Fields Required:** Name, Email, Password
**Fields Optional:** Phone, Address
**Automatic Actions:**
- Account created as "user" role
- Auto-logged in
- Redirected to Dashboard
- Ready to file complaints immediately

**Account created in:** <5 seconds

---

### STAFF ACCOUNT CREATION (Admin Task)

**Location:** Dashboard → Manage Users → Create New User
**Who:** Admin only
**Fields Required:** Name, Email, Password, Department, Role
**Fields Optional:** Phone, Address
**Additional Steps:**
1. Admin selects "Department Staff" role
2. Admin chooses which department
3. System creates account
4. Staff member receives login credentials
5. Staff needs to log in separately (admin can't auto-login as staff)

**Account created in:** 1-2 minutes

---

### ADMIN ACCOUNT CREATION (Admin Task)

**Location:** Dashboard → Manage Users → Create New User
**Who:** Existing admin only
**Fields Required:** Name, Email, Password, Role
**Fields Optional:** Phone, Address, Department
**Steps:**
1. Admin selects "Administrator" role
2. Admin fills in details
3. System creates account
4. New admin can log in immediately
5. New admin has full system access

**Account created in:** 1-2 minutes

---

## SHARING LOGIN CREDENTIALS

### User Accounts:
- Users register themselves → No credentials to share

### Staff Accounts:
- Admin creates account in "Manage Users"
- Admin must share:
  - Email
  - Temporary Password
- Staff should change password on first login

### Admin Accounts:
- Admin creates account in "Manage Users"
- Admin must share:
  - Email
  - Temporary Password
- Admin should change password on first login

---

## SECURITY BEST PRACTICES

### For Admins:
✅ Do:
- Use strong passwords (8+ chars, special chars)
- Change temporary passwords after first use
- Assign staff to appropriate departments
- Deactivate accounts when staff leave
- Keep admin account credentials secure

❌ Don't:
- Share admin credentials with non-admins
- Use same password for multiple accounts
- Create accounts for testing in production
- Leave temporary passwords unchanged

### For Staff:
✅ Do:
- Change temporary password on first login
- Use unique, strong passwords
- Keep password confidential
- Log out when done

❌ Don't:
- Share login credentials
- Use same password as email service
- Write password in plain text

### For Users:
✅ Do:
- Create strong passwords
- Verify email address is correct
- Keep password safe

❌ Don't:
- Share account with others
- Use obvious passwords

---

## TROUBLESHOOTING

### Issue: Can't create staff account
**Solution:**
- Ensure you're logged in as Admin
- Ensure department exists (create in Manage Departments first)
- Ensure all required fields filled
- Check email not already in use

### Issue: Staff can't log in
**Solution:**
- Verify email address is correct
- Verify temporary password was provided
- Try password reset (if implemented)
- Check if account is active in Manage Users

### Issue: User can't register
**Solution:**
- Check email not already registered
- Ensure password is minimum 6 characters
- Check all required fields filled
- Check MongoDB is running

### Issue: New Admin can't access admin features
**Solution:**
- Verify user role is "admin" in Manage Users
- Log out and log back in
- Clear browser cache
- Check role has proper permissions

---

## ACCOUNT MANAGEMENT

### View All Accounts:
- Admin → Manage Users → See table of all users

### Filter Accounts:
- By Role: User, Admin, Staff
- By Status: Active, Inactive

### Deactivate Account:
- Admin → Manage Users → Find user → (Delete/Deactivate option)
- User can no longer log in

### Change User Role:
- Admin → Manage Users → Edit user → Change role → Save

---

## INITIAL SYSTEM SETUP

### First Time Setup:

**1. Create Initial Admin:**
- Register as regular User (public)
- Access database directly or use API
- Change role from "user" to "admin"
- OR provide initial admin credentials

**2. Create Departments:**
- Admin → Manage Departments → Create
- Create for each city department

**3. Create Department Heads:**
- Admin → Manage Users → Create New User
- Select Department Staff role
- Assign to created departments
- These become department heads

**4. Add Staff to Departments:**
- Create more staff accounts in Manage Users
- Assign to appropriate departments

**5. System Ready:**
- Users can now register and file complaints
- Admin can assign to departments
- Staff can handle complaints

---

## SUMMARY TABLE

| Feature | User | Staff | Admin |
|---------|------|-------|-------|
| **Account Creation** | Self (Public) | Admin Only | Admin Only |
| **Creation Location** | /register | Manage Users | Manage Users |
| **Password Set By** | User | Admin | Admin |
| **First Action** | File Complaint | Login & Work | Manage System |
| **Can Create Other Users** | No | No | Yes |
| **Requires Department** | No | Yes | No |
| **Auto-Logged In** | Yes | No | No |
| **Can View All Complaints** | No (own only) | No (assigned) | Yes |
| **Can Assign Work** | No | No | Yes |
| **Can Create Departments** | No | No | Yes |

---

## QUICK ACCESS LINKS

- **Public Registration:** http://localhost:5173/register
- **Login:** http://localhost:5173/login
- **Create Staff/Admin:** Admin Dashboard → Manage Users → Create New User
- **View All Users:** Admin Dashboard → Manage Users
- **Create Department:** Admin Dashboard → Manage Departments
