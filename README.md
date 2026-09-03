# ALS Learning Hub

Web application para sa Alternative Learning System (ALS). May hiwalay na workspace para sa administrators, teachers, at students.

## Mga Tampok

- Public homepage, tungkol sa ALS, at teacher information page
- Email/password authentication gamit ang Supabase
- Role-based dashboards para sa admin, teacher, at student
- Student dashboard na may progress total, Todo list, announcements, modules, at quizzes
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

1. `sql/database.sql` para sa database schema
2. `sql/fix-rls.sql` para sa pangunahing RLS fixes
3. `sql/content-management-upgrade.sql` para sa uploader, quiz creator, at maximum quiz attempts
4. `sql/site-settings.sql` para sa editable landing page content at multiple teacher profiles/pictures
5. `sql/announcements.sql` para sa announcements, optional pictures/PDFs, audience filters, at landing-page publishing
6. `sql/admin-content-and-users.sql`, `sql/admin-stats-policies.sql`, at `sql/admin-users-management.sql` para sa admin policies
7. `sql/setup-accounts.sql` para sa sample teacher at student accounts
8. `sql/setup-admin.sql` para sa admin account configuration

Ang `sql/database.sql` ay schema reference. Kung hindi ito direktang ma-run dahil sa table order o existing objects, gamitin ang project-specific setup/fix scripts at i-check ang resulta gamit ang `sql/check-*.sql` files.

Pagkatapos mag-set up, gamitin ang `verify-all.mjs` o ang ibang `verify-*.mjs` scripts para sa verification. Ang mga verification script ay nangangailangan ng tamang Supabase environment variables.

### Demo Accounts

Ang `sql/setup-accounts.sql` ay gumagawa ng sumusunod na accounts:

| Role | Email | Password |
| --- | --- | --- |
| Teacher | `teacher.alslearninghub@gmail.com` | `Teacher@12345` |
| Student | `student.alslearninghub@gmail.com` | `Student@12345` |
| Admin | `alslearninghub.admin@gmail.com` | `Admin@12345` |

Ang admin account ay kino-configure sa `sql/setup-admin.sql`. Palitan ang demo credentials bago gamitin sa production.

### Bulk Student Import

Sa **Admin > Users > Import Students**, mag-upload ng `.xlsx` o `.xls` file. Gamitin ang template button para makuha ang tamang columns: `first_name`, `last_name`, `email`, `username`, `password`, `education_level`, at `lrn`. Student accounts lang ang ginagawa ng bulk import; ang bawat row na may error ay ipinapakita pagkatapos ng upload. I-format bilang **Text** ang `lrn` column para mapanatili ang leading zeroes.

### Admin Settings

Sa **Settings > General**, maaaring i-edit ng admin ang hero ng landing page, About tab, Teacher tab, at report summary. Sa Teacher tab, gamitin ang **Add another teacher** para magdagdag ng teacher name, role, bio, quote, at picture. Lahat ng nadagdag na teacher ay lalabas sa public Teacher tab. Ang changes ay naka-save sa `site_settings` at `site_teachers` tables; patakbuhin muna ang `sql/site-settings.sql`.

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