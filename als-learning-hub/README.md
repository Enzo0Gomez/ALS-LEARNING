# ALS Learning Hub

A learning management system for the Alternative Learning System (ALS) built with React + Vite + Supabase.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` (or the next available port).

## 👥 Demo Accounts

All accounts are already set up in the Supabase database and verified working.
Select the matching role (Teacher / Student) on the Login page when signing in —
Admin accounts work regardless of the selected tab.

| Role    | Email                                | Password       | Name                 | Notes                          |
|---------|--------------------------------------|----------------|----------------------|--------------------------------|
| Admin   | alslearninghub.admin@gmail.com       | Admin@12345    | System Administrator | Redirects to Admin Dashboard   |
| Teacher | teacher.alslearninghub@gmail.com     | Teacher@12345  | Maria Tan            | Redirects to Teacher Dashboard |
| Student | student.alslearninghub@gmail.com     | Student@12345  | Juan Dela Cruz       | LRN: 136100123456              |

> ⚠️ **Note:** These are development/demo accounts. Change the passwords before deploying to production.

## 📝 Student Registration

New students can register through the **Sign Up** page. Registration requires:

- Learner Reference Number (LRN)
- Full name
- Email address
- Username
- Education level (Basic Literacy / Elementary / Junior High School / Senior High School)
- Password (minimum 6 characters)

### ⚠️ Email Confirmation

Email confirmation is currently **enabled** in the Supabase project. This means:

- New signups must click the verification link emailed to them before logging in
- The built-in Supabase email service is limited to **2 emails per hour** (free tier)

To let new students log in immediately without email verification, disable it in:
**Supabase Dashboard → Authentication → Sign In / Providers → Email → Confirm email → OFF**

## 🗄️ Database Setup Scripts

SQL scripts used during initial setup (run via Supabase Dashboard → SQL Editor):

| Script                | Purpose                                                        |
|-----------------------|----------------------------------------------------------------|
| `setup-admin.sql`     | Confirms admin email + creates profile/admin rows              |
| `setup-accounts.sql`  | Creates teacher & student auth users, profiles, and RLS policies |
| `fix-rls.sql`         | Recreates RLS policies on `profiles` (select/insert/update own + admin read-all) |
| `fix-identities.sql`  | Inserts missing `auth.identities` rows                         |
| `fix-metadata.sql`    | Normalizes `raw_user_meta_data` for manually created users     |
| `fix-tokens.sql`      | Sets NULL token columns to empty strings (required by GoTrue)  |

Diagnostic scripts (safe to re-run anytime):

| Script                  | Purpose                                    |
|-------------------------|--------------------------------------------|
| `check-admin.sql`       | Verifies auth user, profiles, admins rows  |
| `check-enums.sql`       | Lists all enum type values                 |
| `check-rls.sql`         | Lists RLS policies on profiles & admins    |
| `check-identities.sql`  | Compares users & identities rows           |

Helper Node.js scripts:

| Script               | Purpose                                              |
|----------------------|------------------------------------------------------|
| `create-admin.mjs`   | Creates an admin auth user (edit credentials inside) |
| `create-accounts.mjs`| Creates teacher/student auth users                   |
| `verify-all.mjs`     | Tests login for all three demo accounts              |

## 🏗️ Tech Stack

- **React 19** + **Vite**
- **Tailwind CSS 4**
- **Supabase** (Auth + Postgres database)
- **Oxlint** for linting

## 📁 Project Structure

```
src/
├── components/
│   ├── Admin/
│   │   └── AdminDashboard.jsx
│   ├── Student/
│   │   └── StudentDashboard.jsx
│   ├── Teacher/
│   │   └── TeacherDashboard.jsx
│   ├── Homepage.jsx
│   ├── Aboutpage.jsx
│   ├── Teacher.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   └── Navbar.jsx
├── lib/
│   └── supabase.js        # Supabase client
├── App.jsx                # Routing / page state
└── main.jsx
```

## 🔐 Authentication Flow

1. User logs in with email + password (`supabase.auth.signInWithPassword`)
2. App fetches the user's profile from the `profiles` table
3. Based on `profile.role`, the user is redirected to their dashboard:
   - `admin` → Admin Dashboard
   - `teacher` → Teacher Dashboard
   - `student` → Student Dashboard
4. If the selected login tab doesn't match the account's actual role, login is rejected with a helpful message