# ALS Learning Hub

Web application para sa Alternative Learning System (ALS). May hiwalay na workspace para sa administrators, teachers, at students.

## Mga Tampok

- Public homepage, tungkol sa ALS, at teacher information page
- Email/password authentication gamit ang Supabase
- Role-based dashboards para sa admin, teacher, at student
- Pamamahala ng users, subjects, modules, quizzes, at learner progress
- Announcements para sa teachers, students, at public landing page
- Row Level Security (RLS) policies para maprotektahan ang data

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Supabase (authentication at PostgreSQL database)

## Mga Kailangang I-install

- Node.js 18 o mas bago
- npm
- Supabase project

## Local Development

1. I-clone ang repository at pumunta sa project folder.

	```bash
	git clone https://github.com/Enzo0Gomez/ALS-LEARNING.git
	cd ALS-LEARNING
	```

2. I-install ang dependencies.

	```bash
	npm install
	```

3. Gumawa ng `.env.local` sa root ng project:

	```env
	VITE_SUPABASE_URL=https://your-project.supabase.co
	VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
	```

	Makikita ang mga value na ito sa Supabase project settings. Huwag maglagay ng service-role key sa frontend o i-commit ang `.env.local`.

4. Simulan ang development server.

	```bash
	npm run dev
	```

	Buksan ang URL na ibibigay ni Vite, karaniwang `http://localhost:5173`.

## Supabase Database Setup

Patakbuhin ang SQL files sa **Supabase Dashboard > SQL Editor**. Inirerekomendang order:

1. `database.sql` para sa database schema
2. `fix-rls.sql` para sa pangunahing RLS fixes
3. `content-management-upgrade.sql` para sa uploader, quiz creator, at maximum quiz attempts
4. `site-settings.sql` para sa editable landing page content at multiple teacher profiles/pictures
5. `announcements.sql` para sa announcements, optional pictures/PDFs, audience filters, at landing-page publishing
6. `admin-content-and-users.sql`, `admin-stats-policies.sql`, at `admin-users-management.sql` para sa admin policies
7. `setup-accounts.sql` para sa sample teacher at student accounts
8. `setup-admin.sql` para sa admin account configuration

Ang `database.sql` ay schema reference. Kung hindi ito direktang ma-run dahil sa table order o existing objects, gamitin ang project-specific setup/fix scripts at i-check ang resulta gamit ang `check-*.sql` files.

Pagkatapos mag-set up, gamitin ang `verify-all.mjs` o ang ibang `verify-*.mjs` scripts para sa verification. Ang mga verification script ay nangangailangan ng tamang Supabase environment variables.

### Demo Accounts

Ang `setup-accounts.sql` ay gumagawa ng sumusunod na accounts:

| Role | Email | Password |
| --- | --- | --- |
| Teacher | `teacher.alslearninghub@gmail.com` | `Teacher@12345` |
| Student | `student.alslearninghub@gmail.com` | `Student@12345` |
| Admin | `alslearninghub.admin@gmail.com` | `Admin@12345` |

Ang admin account ay kino-configure sa `setup-admin.sql`. Palitan ang demo credentials bago gamitin sa production.

### Admin Settings

Sa **Settings > General**, maaaring i-edit ng admin ang hero ng landing page, About tab, Teacher tab, at report summary. Sa Teacher tab, gamitin ang **Add another teacher** para magdagdag ng teacher name, role, bio, quote, at picture. Lahat ng nadagdag na teacher ay lalabas sa public Teacher tab. Ang changes ay naka-save sa `site_settings` at `site_teachers` tables; patakbuhin muna ang `site-settings.sql`.

## Available Scripts

| Command | Gamit |
| --- | --- |
| `npm run dev` | Simulan ang local development server |
| `npm run build` | Gumawa ng production build |
| `npm run preview` | I-preview ang production build locally |
| `npm run lint` | Patakbuhin ang Oxlint |

## Production Build

```bash
npm run build
npm run preview
```

Siguraduhing naka-configure ang parehong `VITE_SUPABASE_URL` at `VITE_SUPABASE_PUBLISHABLE_KEY` sa environment ng deployment bago i-build ang application.