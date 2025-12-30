# 🚚 Courier & Parcel Management System – Frontend

A modern **logistics & parcel tracking web application** built with **Next.js 14** and **Tailwind CSS**. This frontend consumes the Courier & Parcel Management System backend API and provides role-based dashboards for **Customers, Agents, and Admins**.

---

## 🚀 Live Demo

* **Frontend:** [https://courior-parcel-frontend.vercel.app](https://courior-parcel-frontend.vercel.app)
* **Backend API:** [https://courior-parcel-backend.vercel.app](https://courior-parcel-backend.vercel.app) 
[NOTE: may be live version face issue for confilicting vercel(serverless) with socket.io(real-time).So please check backend code running localy by it's README.md instructions]

---

## 📋 Features

### 👤 Customer

* User registration & login
* Parcel booking with pickup & delivery addresses
* Real-time parcel tracking with Google Maps
* View booking history & parcel status updates
* QR code support for parcel verification

### 🚚 Agent

* View assigned parcels
* Scan QR codes for pickup & delivery
* Live location updates during delivery
* Mark deliveries as completed

### 🛠 Admin

* Dashboard with analytics & metrics
* View all users & parcels
* Assign delivery agents to parcels
* Real-time system notifications

### 🌐 General

* Role-based access control
* Real-time updates using Socket.IO
* Fully responsive design (mobile, tablet & desktop)

---

## 🛠️ Tech Stack

* **Framework:** Next.js 14 (App Router)
* **Styling:** Tailwind CSS
* **State Management:** React Context API & useState
* **HTTP Client:** Axios / Fetch API
* **Real-time Communication:** Socket.IO Client
* **Maps & Location:** Google Maps API
* **Icons:** React Icons

---

## 📦 Installation & Setup

### ✅ Prerequisites

* Node.js **18+**
* npm / pnpm / yarn
* Backend server running locally or deployed

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/humaira-sultana059/courior-parcel-frontend.git
cd courior-parcel-frontend
```

---

### 2️⃣ Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

---

### 3️⃣ Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://courior-parcel-frontend.vercel.app:5000/api
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBf0pPUU-XWrqvSJ1n8MkxBXvEDygPVzXg
```

⚠️ **Do not commit real API keys or secrets to GitHub**

---

### 4️⃣ Run Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open your browser and visit:

```
http://localhost:3000
```

---

### 5️⃣ Build for Production

```bash
npm run build
npm start
```

---

## 🏗️ Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── auth/             # Authentication routes
│   ├── admin/              # Admin dashboard pages
│   ├── customer/           # Customer pages
│   ├── agent/              # Agent pages
│   └── layout.js           # Root layout
│
├── components/             # Reusable components
│   ├── common/             # Shared components
│   ├── ui/                 # UI elements
│   └── forms/              # Form components
│
├── contexts/               # React Context providers
├── hooks/                  # Custom React hooks
├── lib/                    # Utility & helper functions
├── public/                 # Static assets
├── styles/                 # Global styles
└── README.md
```

---

## 🔗 Backend Integration

This frontend integrates seamlessly with the backend API:

* JWT-based authentication
* Role-based routing & authorization
* Real-time tracking via Socket.IO
* QR-based pickup & delivery workflow

---

## 📌 Notes for Reviewers

* Clean & scalable folder structure
* Modern Next.js 14 App Router usage
* Production-ready UI & API integration
* Real-time logistics tracking implemented

---

## 👤 Author

**Humaira Sultana**
MERN stack Developer

---

✅ *Frontend submitted as part of a technical job task*
