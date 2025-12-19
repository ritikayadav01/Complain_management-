# QUICK VISUAL REFERENCE - ACCOUNT CREATION

## WHERE TO CREATE ACCOUNTS

```
┌─────────────────────────────────────────────────────────────┐
│                   SMART CMS SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  REGULAR USERS          STAFF MEMBERS       ADMINS          │
│  (Citizens)             (Employees)         (Managers)      │
│                                                              │
│  GO TO:                 GO TO:              GO TO:          │
│  ┌───────────────┐      ┌──────────────┐   ┌──────────────┐│
│  │ /register     │      │ Dashboard    │   │ Dashboard    ││
│  │              │      │              │   │              ││
│  │ Self-service │      │ Click:       │   │ Click:       ││
│  │              │      │ Manage Users │   │ Manage Users ││
│  │ No admin     │      │              │   │              ││
│  │ needed!      │      │ Create New   │   │ Create New   ││
│  └───────────────┘      │ User         │   │ User         │
│                         │              │   │              │
│  RESULT:               │ Select:      │   │ Select:      │
│  ✅ Auto-logged in     │ Department   │   │ Admin        │
│                        │ Staff        │   │              │
│                        │              │   │ RESULT:      │
│                        │ RESULT:      │   │ ✅ Admin     │
│                        │ ✅ Ready to  │   │ Account      │
│                        │ work!        │   │ created      │
│                        └──────────────┘   └──────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ACCOUNT CREATION FLOWS

### USER REGISTRATION (Public)
```
START
  │
  ├─→ Visit: http://localhost:5173/login
  │
  ├─→ Click: "Sign up" link
  │
  ├─→ See: Registration Form
  │       ┌─────────────────────────┐
  │       │ Register as a Citizen   │
  │       ├─────────────────────────┤
  │       │ Full Name      [____]   │
  │       │ Email          [____]   │
  │       │ Phone          [____]   │
  │       │ Address        [____]   │
  │       │ Password       [____]   │
  │       │ [Sign Up Button]        │
  │       └─────────────────────────┘
  │
  ├─→ Submit Form
  │
  ├─→ Account Created ✅
  │
  ├─→ Auto-Logged In ✅
  │
  └─→ Redirected to User Dashboard ✅
```

---

### STAFF ACCOUNT CREATION (Admin Required)
```
ADMIN LOGIN
  │
  ├─→ Dashboard
  │
  ├─→ Click: "Manage Users" (Sidebar)
  │
  ├─→ See: Users Table + "Create New User" Button
  │
  ├─→ Click: "Create New User"
  │
  ├─→ See: Create User Modal
  │       ┌──────────────────────────────┐
  │       │ Create New User              │
  │       ├──────────────────────────────┤
  │       │ Role: [Dropdown]             │
  │       │  ⭐ Regular User (Citizen)  │
  │       │  ✦ Administrator            │
  │       │  ✦ Department Staff Member  │ ← Select this
  │       │                              │
  │       │ Full Name      [_______]     │
  │       │ Email          [_______]     │
  │       │ Password       [_______]     │
  │       │ Phone          [_______]     │
  │       │ Address        [_______]     │
  │       │ Department:    [Dropdown] ✓  │ Required
  │       │                              │
  │       │ [Create Account] [Cancel]   │
  │       └──────────────────────────────┘
  │
  ├─→ Select: "Department Staff Member"
  │
  ├─→ Fill Form
  │   - Name: "Jane Smith"
  │   - Email: "jane.smith@gov.com"
  │   - Password: "staff123456"
  │   - Department: "Infrastructure"
  │
  ├─→ Click: "Create Account"
  │
  ├─→ Account Created ✅
  │   Email: jane.smith@gov.com
  │   Password: staff123456
  │   Department: Infrastructure
  │
  ├─→ Admin Shares Credentials with Jane
  │
  └─→ Jane Logs In & Sees Staff Dashboard ✅
```

---

### ADMIN ACCOUNT CREATION (Admin Only)
```
EXISTING ADMIN LOGIN
  │
  ├─→ Dashboard
  │
  ├─→ Click: "Manage Users"
  │
  ├─→ Click: "Create New User"
  │
  ├─→ See: Create User Modal
  │       ┌──────────────────────────────┐
  │       │ Create New User              │
  │       ├──────────────────────────────┤
  │       │ Role: [Dropdown]             │
  │       │  ⭐ Regular User (Citizen)  │
  │       │  ✦ Administrator            │ ← Select this
  │       │  ✦ Department Staff Member  │
  │       │                              │
  │       │ Full Name      [_______]     │
  │       │ Email          [_______]     │
  │       │ Password       [_______]     │
  │       │ Phone          [_______]     │
  │       │ Address        [_______]     │
  │       │ Department: (Skipped)        │
  │       │                              │
  │       │ [Create Account] [Cancel]   │
  │       └──────────────────────────────┘
  │
  ├─→ Select: "Administrator"
  │
  ├─→ Fill Form
  │   - Name: "New Admin"
  │   - Email: "admin2@gov.com"
  │   - Password: "adminpass123456"
  │
  ├─→ Click: "Create Account"
  │
  ├─→ Admin Account Created ✅
  │   Email: admin2@gov.com
  │   Password: adminpass123456
  │
  ├─→ Admin Shares Credentials
  │
  └─→ New Admin Logs In & Gets Full Access ✅
```

---

## WHAT EACH ROLE SEES

### REGULAR USER
```
┌──────────────────┐
│  User Dashboard  │
├──────────────────┤
│ 📊 My Stats      │
│ ➕ File Complaint│
│ 📋 My Complaints │
└──────────────────┘
```

### DEPARTMENT STAFF
```
┌────────────────────┐
│ Staff Dashboard    │
├────────────────────┤
│ 📊 My Dashboard    │
│ ✅ Assigned Work   │
└────────────────────┘
```

### ADMIN
```
┌──────────────────────────┐
│  Admin Dashboard         │
├──────────────────────────┤
│ 📊 System Analytics      │
│ 📄 All Complaints        │
│ 🏢 Manage Departments    │
│ 👥 Manage Users    ← Create accounts here
│ 🗺️  Heatmap             │
└──────────────────────────┘
```

---

## KEY DIFFERENCES AT A GLANCE

```
FEATURE                 USER        STAFF       ADMIN
─────────────────────────────────────────────────────
HOW TO CREATE         /register    Dashboard   Dashboard
                      (Self)       (Admin)     (Admin)
                      
WHO CREATES IT         You         Admin       Admin

PASSWORD SET BY        You         Admin       Admin

DEPARTMENT             Not req.    REQUIRED    Not req.

AUTO-LOGIN            Yes         No          No

FIRST ACTION          File         Login &     Login &
                      Complaint    Work        Manage

CAN CREATE OTHERS     No           No          Yes

ROLES AVAILABLE       1            1           1
                      (User)       (Staff)     (Admin)
```

---

## SIDEBAR NAVIGATION

### USER SIDEBAR
```
🏠 Dashboard
➕ File New Complaint
📋 My Complaints
```

### STAFF SIDEBAR
```
🏠 Dashboard
✅ My Assigned Complaints
```

### ADMIN SIDEBAR
```
📊 Dashboard
📄 All Complaints
⚙️  Manage Departments
👥 Manage Users ← CLICK HERE TO CREATE ACCOUNTS
🗺️  Complaints Heatmap
```

---

## AUTHENTICATION FLOW

```
USER VISITS SITE
        │
        ├─ NO ACCOUNT
        │   │
        │   └─→ /register ───────→ Fill Form
        │       │                   │
        │       └───────────────────┴─→ Create Account
        │                               │
        │                               └─→ Auto-Login
        │                                   │
        │                                   └─→ Dashboard
        │
        ├─ HAS ACCOUNT
        │   │
        │   └─→ /login ───────→ Enter Email + Password
        │                       │
        │                       └─→ Verify Credentials
        │                           │
        │                           └─→ Check Role
        │                               │
        │            ┌──────────────────┼──────────────────┐
        │            │                  │                  │
        │            ▼                  ▼                  ▼
        │         User          Department Staff        Admin
        │        Dashboard      Dashboard              Dashboard
        │
        └─ LOGGED IN ────────────────────────────────────┐
                                                         │
                                                         └─→ Use System
```

---

## SUMMARY TABLE

| Action | Role | Location | Who | Time |
|--------|------|----------|-----|------|
| Register as Citizen | User | /register | Self | Instant |
| Create Staff Account | Admin | Dashboard→Manage Users | Admin | 1-2 min |
| Create Admin Account | Admin | Dashboard→Manage Users | Admin | 1-2 min |
| Login | Any | /login | Self | Instant |
| View Users | Admin | Dashboard→Manage Users | View Only | Instant |
| Filter Users | Admin | Dashboard→Manage Users | Admin | Instant |

---

## MOST COMMON QUESTIONS

**Q: Can users create admin accounts?**
A: ❌ No, only admins can create admin accounts.

**Q: Can users create staff accounts?**
A: ❌ No, only admins can create staff accounts.

**Q: Can I create my own account as staff?**
A: ❌ No, an admin must create your staff account.

**Q: Can staff create accounts?**
A: ❌ No, only admins can create accounts.

**Q: Do I get auto-logged in as staff?**
A: ❌ No, staff must login separately with provided credentials.

**Q: Do I get auto-logged in as admin?**
A: ❌ No, admin must login separately with provided credentials.

**Q: Can users register themselves?**
A: ✅ Yes! Go to /register and self-register.

**Q: How do I create a staff account?**
A: ✅ Admin: Dashboard → Manage Users → Create New User → Select "Department Staff"

**Q: How do I create an admin account?**
A: ✅ Admin: Dashboard → Manage Users → Create New User → Select "Administrator"
