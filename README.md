# Smart Complaint Management System

A full-stack MERN (MongoDB, Express, React, Node.js) web application for managing citizen complaints with AI-powered routing, real-time updates, and comprehensive analytics.

## 🚀 Features

### User Portal
- **Registration & Authentication**: Secure JWT-based authentication
- **File Complaints**: Submit complaints with title, description, category, priority, geo-location, and attachments
- **Real-time Status Tracking**: Track complaint status through timeline (Submitted → Reviewed → Assigned → In-Progress → Resolved)
- **Chat System**: Real-time chat with assigned staff
- **Notifications**: In-app notification panel for updates
- **Complaint History**: View and filter all submitted complaints
- **Feedback & Rating**: Rate and provide feedback after resolution

### Admin Portal
- **Analytics Dashboard**: 
  - Complaints per category
  - Complaints by priority
  - Unresolved complaints count
  - SLA violations tracking
  - Department workload distribution
- **Complaint Management**: View, assign, and manage all complaints
- **Department Management**: Create and manage departments
- **User Management**: View and manage all users
- **Heatmap**: Visual representation of complaints by location

### Department Staff Portal
- **Assigned Complaints**: View all complaints assigned to the staff member
- **Update Progress**: Update complaint status and add comments
- **Chat Response**: Respond to users in real-time
- **Upload Resolution Images**: Attach images when resolving complaints
- **Mark as Completed**: Resolve complaints with detailed resolution summary

### AI Integration
- **Auto-categorization**: Automatically categorize complaints based on description
- **Auto-priority Assignment**: Assign priority levels (low/medium/high) using AI
- **Auto-routing**: Route complaints to appropriate departments
- **Resolution Summary**: Generate professional resolution summaries

### Additional Features
- **SLA System**: Automatic escalation for SLA violations
- **Real-time Updates**: WebSocket-based real-time notifications and chat
- **File Upload**: Support for images and videos in complaints
- **Geolocation**: Capture and display complaint locations
- **Role-based Access Control**: Secure access based on user roles

## 📁 Project Structure

```
smart_complaint_management/
├── backend/
│   ├── controllers/          # Request handlers
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── middleware/           # Auth, upload, validation
│   ├── services/             # AI service, notification service
│   ├── socket/               # WebSocket handlers
│   ├── cron/                 # Scheduled tasks (SLA monitoring)
│   ├── utils/                # Utility functions
│   ├── uploads/              # Uploaded files
│   ├── server.js             # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   │   ├── auth/         # Login, Register
│   │   │   ├── user/         # User portal pages
│   │   │   ├── admin/        # Admin portal pages
│   │   │   └── staff/        # Staff portal pages
│   │   ├── contexts/         # React contexts (Auth, Socket)
│   │   ├── services/         # API service layer
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── public/
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **React Leaflet** - Maps
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.IO** - WebSocket server
- **Multer** - File uploads
- **Bcrypt** - Password hashing
- **Node-cron** - Scheduled tasks

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/smart_complaint_management
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   AI_API_KEY=your_openai_api_key_here
   AI_API_URL=https://api.openai.com/v1/chat/completions
   MAX_FILE_SIZE=10485760
   UPLOAD_PATH=./uploads
   FRONTEND_URL=http://localhost:5173
   SLA_LOW_PRIORITY=72
   SLA_MEDIUM_PRIORITY=48
   SLA_HIGH_PRIORITY=24
   
   # Admin User Credentials (Auto-created on first server start)
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=admin123
   ADMIN_NAME=System Administrator
   ```

5. **Create uploads directory**
   ```bash
   mkdir uploads
   mkdir uploads/complaints
   mkdir uploads/chat
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## 🔐 Default Users

### Admin User (Auto-Created)
The admin user is **automatically created** on first server start from environment variables:
- **Email**: Set via `ADMIN_EMAIL` in `.env` (default: admin@example.com)
- **Password**: Set via `ADMIN_PASSWORD` in `.env` (default: admin123)
- **Role**: `admin` (immutable - cannot be changed)
- **Creation**: Only via environment seeding, not through registration

⚠️ **Important**: 
- Admin role cannot be created through `/api/auth/register`
- Admin role cannot be changed or removed
- Admin users cannot be deactivated or deleted
- Only one admin user is created per `ADMIN_EMAIL`

### Other Users
**Staff User:** Created by Admin via "Manage Users"
- Email: staff@example.com (created by admin)
- Password: Set by admin during creation
- Role: department_staff

**Regular User:** Self-registration via `/api/auth/register`
- Email: user@example.com (self-registered)
- Password: Set during registration
- Role: user

## 👥 Account Creation Guide

The system has **THREE different account creation mechanisms** based on user role:

### Regular User (Citizen)
- **Who Creates:** User themselves (Public)
- **How:** Click "Sign Up" on login page
- **Credentials Required:** Name, Email, Password

### Department Staff
- **Who Creates:** Admin only
- **How:** Admin Dashboard → Manage Users → Create New User → Select "Department Staff"
- **Requires:** Name, Email, Password, Department assignment

### Administrator
- **Who Creates:** System (Auto-seeded on server start)
- **How:** Automatically created from `.env` variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`)
- **Requires:** Environment variables in `.env` file
- **Role:** `admin` (immutable - cannot be changed, deleted, or deactivated)
- **⚠️ Important:** Admin role **CANNOT** be created through:
  - Public registration (`/api/auth/register`)
  - Admin user management interface
  - Direct database manipulation (protected by model hooks)

📖 **See ACCOUNT_CREATION_GUIDE.md for detailed instructions and examples!**

## 📚 Documentation

This project includes comprehensive documentation to help you understand and use every feature:

**START HERE:**
- **[SYSTEM_READY.md](SYSTEM_READY.md)** - ✅ Quick overview of what's been fixed and ready to test

**Complete Testing & Debugging:**
- **[SYSTEM_FIXES_AND_TESTING.md](SYSTEM_FIXES_AND_TESTING.md)** - All fixes applied, testing scenarios, debugging checklist

**Understand How It Works:**
- **[ARCHITECTURE_GUIDE.md](ARCHITECTURE_GUIDE.md)** - Complete system architecture, data flows, component breakdown

**Step-by-Step Workflows:**
- **[INTEGRATION_TEST_GUIDE.md](INTEGRATION_TEST_GUIDE.md)** - Real-world complaint lifecycle from filing to resolution

**Feature Guides:**
- **[FEATURES_GUIDE.md](FEATURES_GUIDE.md)** - Complete features breakdown by role
- **[WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)** - Step-by-step complaint workflows
- **[ACCOUNT_CREATION_GUIDE.md](ACCOUNT_CREATION_GUIDE.md)** - Three different signup mechanisms explained
- **[ACCOUNT_VISUAL_GUIDE.md](ACCOUNT_VISUAL_GUIDE.md)** - Visual flowcharts and diagrams
- **[ACCOUNT_SYSTEM_SUMMARY.md](ACCOUNT_SYSTEM_SUMMARY.md)** - Executive overview
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[QUICKSTART.md](QUICKSTART.md)** - Get started in 5 minutes

---

### Authentication

#### Register
```
POST /api/auth/register
Body: {
  name: string,
  email: string,
  password: string,
  phone?: string,
  address?: string
}
```

#### Login
```
POST /api/auth/login
Body: {
  email: string,
  password: string
}
```

#### Get Profile
```
GET /api/auth/profile
Headers: Authorization: Bearer <token>
```

### Complaints

#### Create Complaint
```
POST /api/complaints
Headers: Authorization: Bearer <token>
Body: FormData {
  title: string,
  description: string,
  category?: string,
  priority?: string,
  location: { lat: number, lng: number },
  address?: string,
  attachments?: File[]
}
```

#### Get All Complaints
```
GET /api/complaints?status=&category=&priority=&page=1&limit=10
Headers: Authorization: Bearer <token>
```

#### Get Complaint by ID
```
GET /api/complaints/:id
Headers: Authorization: Bearer <token>
```

#### Update Status
```
PUT /api/complaints/:id/status
Headers: Authorization: Bearer <token>
Body: {
  status: string,
  comment?: string
}
```

#### Assign Complaint
```
PUT /api/complaints/:id/assign
Headers: Authorization: Bearer <token>
Body: {
  staffId?: string,
  departmentId?: string
}
```

#### Resolve Complaint
```
PUT /api/complaints/:id/resolve
Headers: Authorization: Bearer <token>
Body: FormData {
  resolutionDetails: string,
  images?: File[]
}
```

#### Submit Feedback
```
POST /api/complaints/:id/feedback
Headers: Authorization: Bearer <token>
Body: {
  rating: number (1-5),
  comment?: string
}
```

### Departments

#### Get All Departments
```
GET /api/departments?isActive=true
Headers: Authorization: Bearer <token>
```

#### Create Department (Admin only)
```
POST /api/departments
Headers: Authorization: Bearer <token>
Body: {
  name: string,
  description?: string,
  category: string,
  contactEmail?: string,
  contactPhone?: string
}
```

### Chat

#### Get Messages
```
GET /api/chat/:complaintId
Headers: Authorization: Bearer <token>
```

#### Send Message
```
POST /api/chat/:complaintId
Headers: Authorization: Bearer <token>
Body: FormData {
  message: string,
  attachments?: File[]
}
```

### Notifications

#### Get Notifications
```
GET /api/notifications?isRead=false&page=1&limit=20
Headers: Authorization: Bearer <token>
```

#### Mark as Read
```
PUT /api/notifications/:id/read
Headers: Authorization: Bearer <token>
```

### Analytics (Admin only)

#### Get Dashboard Analytics
```
GET /api/analytics/dashboard
Headers: Authorization: Bearer <token>
```

## 🌐 Deployment

### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel dashboard**
   - `VITE_API_URL`: Your backend API URL
   - `VITE_SOCKET_URL`: Your backend Socket.IO URL

### Backend Deployment (Render/Railway)

#### Using Render:

1. **Create a new Web Service**
2. **Connect your GitHub repository**
3. **Configure build settings:**
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
4. **Set environment variables** (same as `.env` file)
5. **Deploy**

#### Using Railway:

1. **Create a new project**
2. **Add MongoDB service** (or use MongoDB Atlas)
3. **Add Node.js service**
4. **Set environment variables**
5. **Deploy**

### Database Deployment (MongoDB Atlas)

1. **Create MongoDB Atlas account**
2. **Create a new cluster**
3. **Get connection string**
4. **Update `MONGODB_URI` in backend `.env`**
5. **Whitelist IP addresses** (0.0.0.0/0 for all, or specific IPs)

### Environment Variables for Production

**Backend:**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=strong_random_secret_key
JWT_EXPIRE=7d
AI_API_KEY=your_openai_api_key
AI_API_URL=https://api.openai.com/v1/chat/completions
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
FRONTEND_URL=https://your-frontend-domain.vercel.app
SLA_LOW_PRIORITY=72
SLA_MEDIUM_PRIORITY=48
SLA_HIGH_PRIORITY=24
```

**Frontend:**
```env
VITE_API_URL=https://your-backend-domain.render.com/api
VITE_SOCKET_URL=https://your-backend-domain.render.com
```

## 🔧 Configuration

### SLA Configuration
SLA deadlines are configured in hours:
- Low Priority: 72 hours (3 days)
- Medium Priority: 48 hours (2 days)
- High Priority: 24 hours (1 day)

### File Upload Limits
- Maximum file size: 10MB (configurable)
- Allowed types: Images (jpeg, jpg, png, gif), PDFs, Videos (mp4, mov, avi)

### AI Service Configuration
The AI service uses OpenAI's API. You can:
- Use OpenAI API (default)
- Replace with other AI services by modifying `backend/services/ai.service.js`

## 🧪 Testing

### Manual Testing Checklist

1. **Authentication**
   - [ ] User registration
   - [ ] User login
   - [ ] Profile update
   - [ ] Token expiration handling

2. **Complaint Management**
   - [ ] File new complaint
   - [ ] View complaint details
   - [ ] Update complaint status
   - [ ] Assign complaint to staff
   - [ ] Resolve complaint
   - [ ] Submit feedback

3. **Real-time Features**
   - [ ] Chat messages
   - [ ] Status updates
   - [ ] Notifications

4. **Admin Features**
   - [ ] View analytics
   - [ ] Manage departments
   - [ ] Manage users
   - [ ] View heatmap

5. **Staff Features**
   - [ ] View assigned complaints
   - [ ] Update status
   - [ ] Chat with users
   - [ ] Resolve complaints

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email support@example.com or create an issue in the repository.

## 🎯 Future Enhancements

- [ ] Email notifications
- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Export to PDF/Excel
- [ ] Automated escalation workflows
- [ ] Integration with external services

---

**Built with ❤️ using MERN Stack**




