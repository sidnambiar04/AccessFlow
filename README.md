# AccessFlow — Employee Onboarding & Access Management System

AccessFlow is an enterprise internal company portal built with the **MERN stack** (MongoDB, Express, React, Node.js). It streamlines employee registration, administrator review and approval, role assignment, and independent section-level authorization.

---

## 🌟 Key Architecture & Highlights

- **Decoupled Roles & Permissions:** An employee's role (`Developer` or `Sales`) does **not** automatically grant permissions. The administrator independently controls access to `Project Management` and `Sales Management` sections via granular toggles.
- **Strict Onboarding Lifecycle:** Self-registration puts accounts into `pending` status. A pending employee cannot access internal resources until an Admin reviews and approves them.
- **Immediate Server-Side Authorization:** Security checks fetch live user permissions from MongoDB on every request. When permissions are revoked, access is denied immediately even with an active JWT token.
- **Dynamic Role-Based Navigation:** Sidebars dynamically adapt to display only authorized sections. Manual URL attempts to bypass navigation are caught and blocked by route guards and backend middleware.
- **Secure Admin Seeding:** No public registration for Admins. The system Administrator is securely initialized through a dedicated backend seed script.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router DOM, Axios, Lucide React, Recharts
- **Backend:** Node.js, Express.js (ES Modules)
- **Database:** MongoDB Atlas / Local MongoDB with Mongoose ODM
- **Security:** JSON Web Tokens (JWT), bcryptjs password hashing

---

## 📁 Project Structure

```text
AccessFlow/
├── client/                     # Frontend React + Vite application
│   ├── src/
│   │   ├── components/         # Layout (Navbar, Sidebar), Common components
│   │   ├── context/            # AuthContext (state, login, logout, live permissions)
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, PendingApproval
│   │   │   ├── admin/          # Overview, PendingRequests, Employees, RolesPermissions
│   │   │   └── employee/       # EmployeeDashboard, ProjectResources, SalesResources, Profile
│   │   ├── routes/             # ProtectedRoute, AdminRoute, PermissionRoute
│   │   └── services/           # Axios API client & endpoints (auth, admin, resources)
│   └── package.json
│
├── server/                     # Backend Express REST API
│   ├── config/                 # MongoDB Mongoose connection
│   ├── controllers/            # Auth, Admin, and Resource business logic
│   ├── middleware/             # JWT authenticate, requireAdmin, requirePermission
│   ├── models/                 # User, AccessRequest, Resource schemas
│   ├── routes/                 # Express route definitions
│   ├── seed/                   # seedAdmin.js script
│   ├── .env.example            # Sample environment variables
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended; tested on v22.14.0)
- **npm** (v10+)
- **MongoDB Atlas** cluster URI or local MongoDB instance

---

### 1. Backend Setup

1. Open your terminal and navigate to `server`:
   ```bash
   cd server
   npm install
   ```

2. Create a `.env` file in the `server` directory (based on `.env.example`):
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=super_secret_jwt_key_here
   CLIENT_URL=http://localhost:5173
   ```

3. Seed the initial Administrator account and demo resources:
   ```bash
   npm run seed
   ```
   **Default Admin Credentials:**
   - **Email:** `admin@accessflow.com`
   - **Password:** `AdminPassword123!`

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

---

### 2. Frontend Setup

1. Open a new terminal and navigate to `client`:
   ```bash
   cd client
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The client application will run at `http://localhost:5173`.

---

## 🧪 Testing the End-to-End Workflow

Follow these steps to test all acceptance criteria:

1. **Sign in as Admin:**
   - Go to `http://localhost:5173/login`.
   - Log in with `admin@accessflow.com` / `AdminPassword123!`.
   - View the Admin Overview, statistics cards, and chart.

2. **Register a New Employee:**
   - Log out or open an Incognito window.
   - Click "Request access" or go to `/register`.
   - Fill in details:
     - Name: `Alex Johnson`
     - Email: `alex@company.com`
     - Department: `Engineering`
     - Password: `Password123!`
   - Submit registration. You will see the **Registration Submitted** screen.
   - If you try to log in now, notice the prompt: *"Your account is pending administrator approval"*.

3. **Admin Review & Independent Access Grant:**
   - Return to the Admin window and open **Pending Requests** (`/admin/requests`).
   - Alex's onboarding request will be listed.
   - Click **Approve**.
   - Assign Role: `Developer`.
   - Grant **Project Management** access (`true`) and leave **Sales Management** (`false`).
   - Click **Confirm Approval**.

4. **Employee Portal Verification:**
   - In Incognito, log in with `alex@company.com` / `Password123!`.
   - Notice:
     - Alex sees **Overview**, **Project Management**, and **Profile** in the sidebar.
     - **Sales Management is completely hidden** from their sidebar.
     - If Alex manually attempts to navigate to `http://localhost:5173/sales`, the Route Guard blocks them and redirects to `/dashboard`.

5. **Dynamic Permission Update & Revocation:**
   - From the Admin window, go to **Roles & Permissions** (`/admin/roles-permissions`).
   - Toggle Alex's **Sales Section** to `Allowed`.
   - Switch to Alex's session and refresh: **Sales Management** instantly appears in the sidebar!
   - Now revoke **Project Section** from Admin: on Alex's next click, access is immediately denied.

---

## 🔒 API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new pending employee
- `POST /api/auth/login` — Sign in and issue JWT token
- `GET /api/auth/me` — Get authenticated user details & live permissions

### Admin Management (Requires Admin Token)
- `GET /api/admin/dashboard/stats` — Metrics & recent requests
- `GET /api/admin/requests` — All registration requests
- `PATCH /api/admin/requests/:id/approve` — Approve request & set role/permissions
- `PATCH /api/admin/requests/:id/reject` — Reject registration request
- `GET /api/admin/users` — Employee directory with search & filters
- `PATCH /api/admin/users/:id/role` — Update employee role
- `PATCH /api/admin/users/:id/permissions` — Toggle independent permissions
- `PATCH /api/admin/users/:id/status` — Activate or suspend account

### Resources
- `GET /api/projects` — List project documents (Requires `projects` permission or Admin)
- `POST /api/projects` — Create project document (Admin only)
- `PUT /api/projects/:id` — Update project document (Admin only)
- `DELETE /api/projects/:id` — Delete project document (Admin only)
- `GET /api/sales` — List sales reports (Requires `sales` permission or Admin)
- `POST /api/sales` — Create sales report (Admin only)
- `PUT /api/sales/:id` — Update sales report (Admin only)
- `DELETE /api/sales/:id` — Delete sales report (Admin only)
- `GET /api/dashboard` — Aggregated recent resources for employee
