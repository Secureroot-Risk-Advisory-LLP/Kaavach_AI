# KAAVACH AI - AI-powered Bug Bounty & Security Research Platform

A full-stack MERN application (MongoDB, Express.js, React.js, Node.js) for connecting security researchers (hackers) with companies through bug bounty programs. Features role-based dashboards, report submission, leaderboards, social feed, and AI integration capabilities.

## 🚀 Features

### User Roles
- **Hacker**: Browse programs, submit reports, earn rewards, track leaderboard stats
- **Company**: Create/manage bug bounty programs, review reports, reward hackers
- **Admin**: Full platform control, user management, program moderation

### Core Features
- ✅ JWT-based authentication with role-based access control
- ✅ Bug bounty program management (create, edit, delete)
- ✅ Report submission with PDF/DOCX file uploads
- ✅ Report review workflow (accept/reject/triage)
- ✅ Reward system with points and leaderboard
- ✅ Social feed (like Instagram/Facebook) with posts, likes, comments
- ✅ Job opportunities and freelancing project posts
- ✅ Dark/light theme toggle
- ✅ Modern UI with Tailwind CSS
- ✅ Responsive design

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher) - Make sure MongoDB is running
- **npm** or **yarn**

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Kaavach
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
# MONGODB_URI=mongodb://localhost:27017/kaavach-ai
# JWT_SECRET=your-super-secret-jwt-key
# PORT=5000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file
# VITE_API_URL=http://localhost:5000/api
```

### 4. Seed Default Admin User

```bash
# From backend directory
npm run seed
```

This creates a default admin user:
- **Email**: admin@kaavach.ai
- **Password**: admin123

⚠️ **Important**: Change the admin password after first login!

## 🚀 Running the Application

### Start Backend Server

```bash
# From backend directory
npm run dev
# or
npm start
```

The backend server will run on `http://localhost:5000`

### Start Frontend Development Server

```bash
# From frontend directory
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

### Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## 📁 Project Structure

```
Kaavach/
├── backend/
│   ├── controllers/       # Route controllers
│   │   ├── admin.controller.js
│   │   ├── auth.controller.js
│   │   ├── feed.controller.js
│   │   ├── leaderboard.controller.js
│   │   ├── program.controller.js
│   │   └── report.controller.js
│   ├── middleware/        # Auth & role middleware
│   │   └── auth.middleware.js
│   ├── models/           # MongoDB models
│   │   ├── Feed.model.js
│   │   ├── Program.model.js
│   │   ├── Report.model.js
│   │   └── User.model.js
│   ├── routes/           # API routes
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   ├── company.routes.js
│   │   ├── feed.routes.js
│   │   ├── hacker.routes.js
│   │   ├── leaderboard.routes.js
│   │   ├── program.routes.js
│   │   └── report.routes.js
│   ├── utils/            # Utilities
│   │   ├── generateToken.js
│   │   ├── seed.js
│   │   └── upload.js
│   ├── uploads/          # Uploaded files (created automatically)
│   ├── server.js         # Express server
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   │   ├── Layout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/        # Page components
│   │   │   ├── dashboards/
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── CompanyDashboard.jsx
│   │   │   │   └── HackerDashboard.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Programs.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Register.jsx
│   │   ├── services/     # API services
│   │   │   ├── adminService.js
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── feedService.js
│   │   │   ├── leaderboardService.js
│   │   │   ├── programService.js
│   │   │   └── reportService.js
│   │   ├── store/        # Redux store
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.js
│   │   │   │   └── themeSlice.js
│   │   │   └── store.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🔐 Authentication & Authorization

### User Registration
- Hackers can register directly
- Companies require admin approval
- Admin accounts can only be created via seed script

### Role-Based Access
- **Hacker**: Can submit reports, view programs, access hacker dashboard
- **Company**: Can create programs, review reports, access company dashboard
- **Admin**: Full access to all features and admin dashboard

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Programs
- `GET /api/programs` - Get all programs (with filters)
- `GET /api/programs/:id` - Get single program
- `POST /api/programs` - Create program (Company/Admin)
- `PUT /api/programs/:id` - Update program
- `DELETE /api/programs/:id` - Delete program

### Reports
- `POST /api/reports` - Submit report (Hacker)
- `GET /api/reports/my-reports` - Get hacker's reports
- `GET /api/reports/company-reports` - Get company's reports
- `GET /api/reports/:id` - Get single report
- `PUT /api/reports/:id/status` - Update report status (Company/Admin)

### Feed
- `GET /api/feed` - Get all feed posts
- `POST /api/feed` - Create post
- `POST /api/feed/:id/like` - Like/Unlike post
- `POST /api/feed/:id/comment` - Add comment
- `DELETE /api/feed/:id` - Delete post

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/leaderboard/my-stats` - Get hacker stats

### Admin
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/approve` - Approve/Reject company
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get dashboard stats

## 🎨 UI Features

- **Dark/Light Theme**: Toggle between themes using the moon/sun icon
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Built with Tailwind CSS
- **Icons**: Lucide React icons
- **Notifications**: React Hot Toast for user feedback

## 🧪 Testing the Application

### 1. Create Test Accounts

1. Register as a **Hacker**
2. Register as a **Company** (will need admin approval)
3. Login as **Admin** (admin@kaavach.ai / admin123)

### 2. Admin Workflow

1. Login as admin
2. Go to Admin Dashboard → Users tab
3. Approve company accounts
4. View platform statistics

### 3. Company Workflow

1. Login as company (after admin approval)
2. Create bug bounty programs
3. Review submitted reports
4. Accept/reject reports and assign rewards

### 4. Hacker Workflow

1. Login as hacker
2. Browse active programs
3. Submit bug reports with PDF/DOCX files
4. View report status and rewards
5. Check leaderboard position

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod` or start MongoDB service
- Check MongoDB URI in `.env` file
- Verify MongoDB is accessible on the specified port

### Port Already in Use
- Change `PORT` in backend `.env`
- Update `VITE_API_URL` in frontend `.env` accordingly

### File Upload Issues
- Ensure `backend/uploads` directory exists (created automatically)
- Check file size limits (10MB max)
- Verify file types (PDF, DOCX only)

### CORS Issues
- Backend CORS is configured for `localhost`
- Update CORS settings in `server.js` for production

## 🔒 Security Notes

- Change `JWT_SECRET` in production
- Use strong passwords
- Implement rate limiting in production
- Add HTTPS in production
- Validate file uploads properly
- Sanitize user inputs

## 🚀 Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use MongoDB Atlas or production MongoDB
3. Set secure `JWT_SECRET`
4. Configure CORS for your domain
5. Use environment variables for all secrets

### Frontend
1. Build: `npm run build`
2. Serve static files or deploy to Vercel/Netlify
3. Update `VITE_API_URL` to production API URL
4. Configure environment variables

## 📝 License

This project is licensed under the ISC License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ using MERN Stack**

