# 🍽️ Liyu Restaurant Management System

A full-stack web app for running a restaurant: customers browse the menu, order online, pay, book tables and leave reviews, while staff and admins manage everything from role-based dashboards.

**🔗 Live demo:** [https://restaurant-management-system-git-master-eden-sahlie-s-projects.vercel.app/]
**⚙️ API:** [https://restaurant-management-system-invy.onrender.com]

> ⏳ **Note:** the backend runs on a free hosting tier that goes to sleep when idle. The first request can take up to a minute to wake it up. After that it's fast.

![Home page](docs/screenshots/home.png)

## 🚀 Try it in one click

You don't need to sign up. On the login page, click one of the demo buttons:

| Button | What you can do |
|---|---|
| **Try as Customer** | Browse the menu, place orders, reserve tables, leave reviews |
| **Try as Admin** | Explore the full admin dashboard (**read-only**: changes are blocked by the API) |

Or log in manually:

| Role | Email | Password |
|---|---|---|
| Customer | `demo.customer@example.com` | `demo1234!` |
| Admin (read-only) | `demo.admin@example.com` | `demo1234!` |

## ✨ Features

**Customers**
- Browse the menu
- Online ordering (dine-in, pickup or delivery) with payment verification
- Table reservations with status tracking
- Reviews and a contact form
- Sign up with email/password or **Google OAuth**
- Password reset by email

**Admin**
- Dashboard with users, orders, menu items and revenue stats
- Menu management (add, edit, delete, image upload)
- User management (create users, change roles, deactivate and restore)
- Order tracking and status updates
- Reservation approval and table assignment
- Low-stock reports from the kitchen
- Customer message inbox

**Staff (waiter and chef dashboards)**
- Role-specific dashboards for handling orders, and for chefs to report low stock

**Security**
- JWT authentication with role-based access control
- Hashed passwords
- A read-only demo mode enforced **on the server** (all write requests from the demo admin return `403`), not just hidden in the UI

## 🛠️ Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, lucide-react, react-hot-toast |
| Backend | Node.js, Express, Passport (Google OAuth), JWT, express-session |
| Database | PostgreSQL (Neon) |
| Payments | Chapa |
| Hosting | Vercel (frontend), Render (backend), Neon (database) |

## 🧱 Architecture

```mermaid
flowchart LR
    U[User's browser] --> F[React + Vite frontend<br/>Vercel]
    F -- REST API + JWT --> B[Node / Express API<br/>Render]
    B --> D[(PostgreSQL<br/>Neon)]
    B --> G[Google OAuth]
    B --> P[Payment provider]
```

```
restaurant-project/
├── restaurant-backend/     # Express API
│   ├── routes/             
auth, googleAuth, menu, orders, admin, reviews, auth, googleAuth, menu, messages, inventory, reservations
│   │                                         
│   ├── db.js               # PostgreSQL connection pool
│   ├── middleware/
auth, role
│   └── server.js
└── restaurant-frontend/    # React app
    └── src/
        ├── admin/  
        ├── api/
        ├── assets/
        ├── chef/
        ├── waiter/
        ├── customer/
        ├── lib/
        ├── shared/         # layout, sidebar
        └── components/     # shared UI (Star rating, confirm provider. ui/)
```

## 📸 Screenshots

| Menu | Ordering |
|---|---|
| ![Menu](docs/screenshots/menu.png) | ![Order](docs/screenshots/order.png) |

| Admin dashboard | User management |
|---|---|
| ![Admin](docs/screenshots/admin-dashboard.png) | ![Users](docs/screenshots/admin-users.png) |

## ⚙️ Run it locally

**Requirements:** Node.js 18+, a PostgreSQL database (local or Neon)

```bash
git clone https://github.com/Eden1916/Restaurant-Management-System.git
cd restaurant-project
```

### 1. Backend

```bash
cd restaurant-backend
npm install
cp .env.example .env     # then fill in your own values
npm start
```

`restaurant-backend/.env.example`:

```env
BACKEND_URL=http://localhost:5000
CHAPA_SECRET_KEY=your-chapa-secret-key
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://user:password@host/dbname?sslmode=require
EMAIL_PASS=your-email-app-password
EMAIL_USER=your-email@example.com
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_EXPIRE=7d
JWT_SECRET=replace-with-a-long-random-string
NEON_BRANCH=main
SESSION_SECRET=replace-with-another-long-random-string
```

Check that it works: <http://localhost:5000/api/test>

### 2. Frontend

```bash
cd restaurant-frontend
npm install
cp .env.example .env
npm run dev
```

`restaurant-frontend/.env.example`:

```env
VITE_GOOGLE_SIGN_IN=http://localhost:5000/api/auth/google
VITE_API_URL=http://localhost:5000
```

Open <http://localhost:5173>.

### 3. Database

**a) Create a PostgreSQL database.** Any PostgreSQL works. A free [Neon](https://neon.tech) project is the easiest option. Copy its connection string into `DATABASE_URL` in `restaurant-backend/.env`.

**b) Create the tables** with the schema file. Choose one way:

- **With `psql`:**
  ```bash
  psql "YOUR_DATABASE_URL" -f database/schema.sql
  ```
- **Without `psql`:** open your provider's SQL editor (for example the Neon SQL Editor), paste the contents of `database/schema.sql`, and run it.

This creates 9 tables: `users`, `categories`, `menu_items`, `orders`, `order_items`, `reservations`, `reviews`, `low_stock_reports` and `contact_messages`.

**c) Create the first admin user.**

1. Start the backend and frontend (steps 1 and 2 above).
2. Sign up a normal account in the app.
3. Promote it to admin in your SQL editor:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
4. Log out and log in again. You now have the admin dashboard, where you can manage users, change roles and create waiter and chef accounts.


## 🔌 API overview

| Route | Purpose |
|---|---|
| `/api/auth` | Register, login, Google sign-in, password reset |
| `/api/menu` | Menu items and categories |
| `/api/orders` | Create and track orders |
| `/api/reservations` | Table reservations |
| `/api/reviews` | Customer reviews |
| `/api/inventory` | Low-stock reports |
| `/api/messages` | Contact messages |
| `/api/admin` | User and message management (admin only) |

## 🧠 What I learned

- Designing a role-based system (customer, waiter, chef, admin) with JWT authorization
- Integrating third-party services: Google OAuth and an online payment gateway
- Deploying a split frontend and backend, and handling CORS and environment variables
- Enforcing permissions on the **server** (the read-only demo account) instead of only hiding buttons in the UI

## 🗺️ Roadmap

- [ ] Automated tests and a CI pipeline
- [ ] Real-time order updates for the kitchen (WebSockets)
- [ ] Docker setup for one-command local development

## 👤 Author

**Eden Sahlie**, software engineering student
[GitHub](https://github.com/Eden1916) · [LinkedIn](https://www.linkedin.com/in/eden-sahlie-729b45357/) · [Email](edensahlie19@gmail.com)