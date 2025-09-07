INSTRUCTIONS.md
Project Goal

Build a simple, government-style chemical reporting website (similar to chemindia.chemicals.gov.in
) with a Supabase backend.
The application should be lightweight, demoable, and easy for a client to test immediately (with demo accounts + sample data).

Tech Stack

Frontend: React (CRA/Vite) or Next.js (recommended).

Styling: Plain CSS or small UI library (Chakra/Material).

Backend/DB: Supabase (Auth + Postgres + Storage + RLS).

Hosting: Vercel/Netlify for frontend; Supabase for DB.

Core Pages & Flows
1. Login Page

Supabase email/password login.

Forgot password flow (Supabase built-in).

Show seeded demo credentials in README.

2. Company Details Page (one-time)

Shown after first login (mandatory).

Fields:

Company Name, Registration Number, Address, Contact Person, Phone, Official Email, Industry Type, GST/PAN, optional Logo.

Saved in company_profiles (linked to auth.uid).

Editable but not required again after first save.

3. Data Entry Page (recurring)

Form for submitting chemical data.

Fields:

Chemical Name, CAS Number, Quantity, Unit, Purity, Hazard Class, Use/Purpose, Storage Conditions, Inventory Date, MSDS Upload, Notes.

Store in chemical_submissions.

Attach file(s) to Supabase Storage.

4. Dashboard

Show summary tiles (e.g., total submissions this month).

Recent submissions (last 5).

Filters: date range, chemical name, CAS, user.

Table view (with pagination).

Group by date.

Export filtered data to CSV.

5. Role-Based Access

Operator: submit chemicals, view own company profile & submissions.

Manager: view all submissions (org/region level).

SuperAdmin: full access (all companies, manage users).

Audit log for manager & superadmin.

Supabase Schema
user_profiles
create table user_profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text not null default 'operator', -- operator | manager | superadmin
  company_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

company_profiles
create table company_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  company_name text not null,
  registration_number text,
  address text,
  contact_person text,
  contact_phone text,
  official_email text,
  industry_type text,
  gst_pan text,
  logo_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

chemical_submissions
create table chemical_submissions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references company_profiles(id),
  submitted_by uuid references auth.users,
  chemical_name text not null,
  cas_number text,
  quantity numeric,
  unit text,
  purity text,
  hazard_class text,
  use_purpose text,
  storage_conditions text,
  inventory_date date,
  msds_url text,
  status text default 'submitted',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

audit_logs
create table audit_logs (
  id bigserial primary key,
  action_by uuid references auth.users,
  action_type text,
  target_table text,
  target_id text,
  details jsonb,
  action_at timestamptz default now()
);

Supabase Row-Level Security (RLS)

Example policy for chemical_submissions:

-- Allow insert if authenticated
create policy "allow insert for authenticated"
on chemical_submissions
for insert
using (auth.role() is not null);

-- Allow select for owner, manager, superadmin
create policy "select owners and managers"
on chemical_submissions
for select
using (
  submitted_by = auth.uid()
  OR exists (
    select 1 from user_profiles up
    where up.id = auth.uid()
    and up.role in ('manager','superadmin')
  )
);


Enable RLS on tables. Adjust per-role as needed.

Demo Accounts
Role	Email	Password
Operator	operator@example.com
	Operator123!
Manager	manager@example.com
	Manager123!
SuperAdmin	admin@example.com
	Admin123!

Seed sample company profiles & chemical submissions.

UI/UX Guidelines

Government style: neutral colors, high contrast.

Large fonts, clear CTAs.

Single-column forms with inline validation.

File upload = drag & drop + browse.

Accessible (ARIA labels, keyboard navigation).

Deliverables

Frontend (React/Next.js) with pages: /login, /company, /dashboard, /submit, /admin.

Supabase SQL file: schema + RLS policies.

Seed script for demo data (users, companies, submissions).

README: setup instructions (env vars, demo credentials, seeding, deployment).

Security checklist: HTTPS, input validation, private file storage, audit logs.

Acceptance Criteria

First login requires company details before dashboard.

Operators can submit + view only their own submissions.

Managers & superadmins can view/export all.

MSDS files saved in Supabase Storage (private, signed URLs for download).

Demo accounts + seed data work immediately after setup.

Stretch Features (Optional)

Approval workflow (reviewed/approved).

Email notifications on new submissions.

Region-based manager access.

Dashboard charts (submissions per week).

Multi-company users.

Audit trail UI.

Task for AI IDE
Build a simple chemical reporting website with Supabase backend.  
Include login, company details, data entry, dashboard, role-based access, and audit logs.  
Seed demo accounts & data. Provide SQL schema, RLS policies, and setup README.  
Keep UI simple, government-style, and mobile-friendly.  