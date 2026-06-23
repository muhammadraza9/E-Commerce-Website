# Style Avenue

Style Avenue is a full-stack e-commerce website for Pakistani fashion clothing, built with a navy blue and gold themed UI for a premium shopping experience.

## 🎨 Theme

- **Navy Blue:** `#0B1F33`
- **Gold:** `#D4AF37`

## 🛠️ Tech Stack

**Frontend**
- Next.js
- Tailwind CSS
- React Context (cart state management)

**Backend**
- Node.js / Express
- Prisma ORM
- MySQL (MariaDB adapter)
- Nodemailer (email notifications)

## ✨ Features

- 🏠 Home page with featured products
- 🛍️ Product listing & detail pages
- 🛒 Cart with persistent state
- 💳 Checkout flow
- 📦 Order confirmation & order tracking
- 👤 User authentication (sign in / sign up)
- 🧑‍💼 Admin panel
  - User management (view, update roles, delete users)
  - Role-based access via `verifyToken` / `verifyAdmin` middleware
- 🔔 Centralized toast notification system (custom navy/gold themed)
- 📱 Fully responsive UI (mobile & desktop)
- 🖼️ Custom circular "SA" monogram logo

## 📁 Project Structure

```
Ecommerce-Store/
├── frontend/          # Next.js application
│   ├── app/           # Pages (Home, Products, Cart, Checkout, Profile, etc.)
│   ├── components/     # Reusable UI components (Navbar, ProductCard, etc.)
│   └── utils/          # Utilities (toast.js, etc.)
├── backend/            # Node.js/Express API
│   ├── controllers/    # Route logic (auth, products, orders, etc.)
│   ├── middleware/     # Auth middleware (verifyToken, verifyAdmin)
│   ├── prisma/          # Prisma schema & seed script
│   └── routes/          # API routes
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MySQL / MariaDB

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/muhammadraza9/E-Commerce-Website.git
   cd E-Commerce-Website
   ```

2. Install dependencies for both frontend and backend
   ```bash
   cd backend
   npm install

   cd ../frontend
   npm install
   ```

3. Set up environment variables (`.env` in `backend/`)
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/ecommerce_db"
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

4. Run Prisma migrations & seed the database
   ```bash
   cd backend
   npx prisma migrate dev
   node prisma/seed.js
   ```

5. Start the development servers
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend (in a new terminal)
   cd frontend
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📌 Notes

- Database: `ecommerce_db`
- Main user table: `user`
- Seed script populates 30 fashion products with Unsplash images

## 📄 License

This project is for personal/portfolio use.

---

Made with 🖤 by [Muhammad Raza](https://github.com/muhammadraza9)
