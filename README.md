# ProjectVault – Teacher-Student Project Showcase

ProjectVault is a clean, production-ready web application built with **Next.js 15 (App Router)** that allows teachers to register, login, and catalog student projects. The general public can explore projects through a robust search system filtering by project titles, descriptions, batch names, tags, and member details.

## Tech Stack
- **Framework**: Next.js 15 (App Router) + TypeScript + React 19
- **Database**: MongoDB + Mongoose with proper indexing for search performance
- **Authentication**: NextAuth.js (Credentials provider)
- **Styling**: Modern dark-theme styling, glassmorphism, responsive cards
- **Validation**: Zod (for input validation and API route protection)
- **Security**: Rate limiting on registrations, hashed passwords, route protection middleware, and ownership verification

---

## Folder Structure
```text
/src/app
  /api               - Registration, Projects lists, Batches
  /dashboard         - Teacher authenticated dashboard
  /projects          - Public listing and detail pages
  /auth              - Custom Login & Registration pages
/components          - Shared UI elements (Navbar, Toast, project cards)
/lib                 - Database connection, validations, auth configs
/models              - Mongoose Schemas (User, Project)
/types               - custom next-auth type overrides
/public              - static icons/logos
```

---

## Local Setup

### 1. Prerequisites
- [Node.js v18+](https://nodejs.org/)
- MongoDB running locally or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster connection string.

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
MONGODB_URI=mongodb://localhost:27017/projectvault
NEXTAUTH_SECRET=your_32_character_hexadecimal_secret_string
NEXTAUTH_URL=http://localhost:3000
```

### 4. Run Seed Script (Optional)
Insert dummy data (a test teacher user `teacher@school.edu` / `Password123!` and 3 featured projects) into your database:
```bash
# Register ts-node or run via node if compiled, or simply execute the seed.js script:
node seed.js
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production & Netlify Deployment

This repository includes a `netlify.toml` file ready for deployment to Netlify:

1. Push your repository to GitHub.
2. Link the repository to Netlify.
3. Configure the following environment variables in the Netlify dashboard:
   - `MONGODB_URI`: Your production MongoDB cluster connection string.
   - `NEXTAUTH_SECRET`: A long random secret key.
   - `NEXTAUTH_URL`: The URL of your deployed site (e.g., `https://your-app-name.netlify.app`).
4. Build settings will automatically read from `netlify.toml`:
   - Build Command: `npm run build`
   - Publish Directory: `.next`
