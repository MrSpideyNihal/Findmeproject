# Academic Project Showcase

<div align="center">

[![Original Repository](https://img.shields.io/badge/Original_Repository-MrSpideyNihal%2FFindmeproject-4f46e5?style=for-the-badge&logo=github)](https://github.com/MrSpideyNihal/Findmeproject)
[![GitHub Stars](https://img.shields.io/github/stars/MrSpideyNihal/Findmeproject?style=for-the-badge&logo=github&color=0f172a&labelColor=1e293b)](https://github.com/MrSpideyNihal/Findmeproject)
[![GitHub Forks](https://img.shields.io/github/forks/MrSpideyNihal/Findmeproject?style=for-the-badge&logo=github&color=0f172a&labelColor=1e293b)](https://github.com/MrSpideyNihal/Findmeproject/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/MrSpideyNihal/Findmeproject?style=for-the-badge&logo=github&color=0f172a&labelColor=1e293b)](https://github.com/MrSpideyNihal/Findmeproject/issues)

</div>
 
>  [**https://github.com/MrSpideyNihal/Findmeproject**](https://github.com/MrSpideyNihal/Findmeproject)

### Version 1.0.0-stable
A unified academic project showcase platform designed for G.H. Raisoni College of Engineering (GHRCE) to exhibit student innovations, promote research, and connect tomorrow's engineers with industry leaders. Built with Next.js 16 (App Router), MongoDB, and NextAuth.

---

## Features

- **Excel Batch Import**: Seamless parsing of .xlsx and .xls files via SheetJS (xlsx) with automatic field mapping and server-side Zod validation.
- **Secure Authentication**: Protected routes (/dashboard, /add-project, /edit-project) guarded by JWT-based NextAuth credentials strategy.
- **Secure Design & Hardened APIs**: 
  - Strict input schemas using Zod validation.
  - Safe MongoDB queries with password values excluded (select: false) by default.
  - Rate limiting on API auth endpoints to prevent brute-force attacks.
- **Advanced Search System**: Fast search filtering by project title, tags, description abstracts, batch years, or specific student/lead names.
- **Performance Aggregation**: Multi-aggregate queries to count team members and batch years efficiently in MongoDB without loading raw records.
- **Modern Clean SaaS UI**: Crisp light theme inspired by Nixtio and BizLink, high contrast typography, responsive toolbar filters, and accessible cards.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript + React 19
- **Database**: MongoDB + Mongoose (with index-optimized search queries)
- **Authentication**: NextAuth.js (Credentials provider)
- **Styling**: Vanilla CSS, Modern Clean Design System, Lucide icons
- **Validation**: Zod (for input validation and API route protection)

---

## Folder Structure

```text
/src/app
  /api               - Registration, bulk excel import, search query endpoint, batches
  /dashboard         - Teacher authenticated dashboard
  /projects          - Public listing and detail pages
  /auth              - Custom Login & Registration pages
/components          - Shared UI elements (Navbar, Toast, project cards, ExcelImport)
/lib                 - Database connection caching, validations, auth configs
/models              - Mongoose Schemas (User, Project)
/types               - custom next-auth type overrides
/public              - static assets and logos
```

---

## Local Setup

### 1. Prerequisites
- Node.js v18+
- MongoDB running locally or a MongoDB Atlas cluster connection string.

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a .env file in the root directory (based on .env.example):
```env
MONGODB_URI=mongodb://localhost:27017/raisoni-projects
NEXTAUTH_SECRET=your_32_character_hexadecimal_secret_string
NEXTAUTH_URL=http://localhost:3000
TEACHER_REGISTRATION_CODE=raisoni_sec_2027
```

### 4. Run Seed Script (Optional)
Insert dummy data (a test teacher user teacher@school.edu / Password123! and 3 featured projects) into your database:
```bash
node seed.js
```

### 5. Start Development Server
```bash
npm run dev
```
Open http://localhost:3000 in your browser.

---

## Production & Netlify Deployment

This repository includes a netlify.toml file ready for deployment to Netlify:

1. Push your repository to GitHub.
2. Link the repository to Netlify.
3. Configure the following environment variables in the Netlify dashboard:
   - MONGODB_URI: Your production MongoDB cluster connection string.
   - NEXTAUTH_SECRET: A long random secret key.
   - NEXTAUTH_URL: The URL of your deployed site (e.g., https://your-app-name.netlify.app).
   - TEACHER_REGISTRATION_CODE: Secret signup token for teachers.
4. Build settings will automatically read from netlify.toml:
   - Build Command: npm run build
   - Publish Directory: .next

---

## Star & Attribution

If you like this project, clone it, or fork it, please **[Star the original repository](https://github.com/MrSpideyNihal/Findmeproject)**!

Original repository: [**https://github.com/MrSpideyNihal/Findmeproject**](https://github.com/MrSpideyNihal/Findmeproject)
