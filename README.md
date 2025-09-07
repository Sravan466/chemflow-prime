# ChemFlow Prime

A comprehensive chemical management and reporting system designed for government compliance and corporate chemical inventory tracking. Built with modern web technologies, ChemFlow Prime provides a secure, scalable platform for chemical data management with role-based access control and comprehensive audit logging.

## 🚀 Live Demo

Visit the live application: [ChemFlow Prime Demo](https://your-demo-url.com)

## 📋 Overview

ChemFlow Prime is a full-stack web application that enables companies to:
- Submit and manage chemical inventory data
- Track chemical usage and compliance
- Generate regulatory reports
- Maintain audit trails for government inspections
- Manage user roles and permissions
- Store and organize MSDS documents

## ✨ Features

- **🔐 Authentication**: Secure email/password login system
- **👥 Role-Based Access**: Operator, Manager, and SuperAdmin roles
- **🏢 Company Profiles**: One-time company registration with logo upload
- **🧪 Chemical Data Entry**: Comprehensive form for chemical submissions
- **📊 Dashboard**: Summary statistics, filters, and data export
- **⚙️ Admin Panel**: System oversight and submission approval
- **📝 Audit Logging**: Complete audit trail for all actions
- **📁 File Storage**: MSDS file uploads with secure storage
- **🔍 Search & Filter**: Advanced search and filtering capabilities
- **📈 Reporting**: Generate compliance and inventory reports

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with modern, responsive design
- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **File Upload**: Multer for file handling

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd chemical-reporting-system
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://hdsldiyhhqwcsacdjdjv.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Get your Supabase keys from: https://supabase.com/dashboard/project/hdsldiyhhqwcsacdjdjv/settings/api

### 3. Database Setup

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/hdsldiyhhqwcsacdjdjv
2. Navigate to **SQL Editor**
3. Run the migration file: `supabase/migrations/20250109000001_initial_schema.sql`
4. Run the seed file: `supabase/seed.sql`

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Database Schema

### Tables

- **user_profiles**: User information and roles
- **company_profiles**: Company registration details
- **chemical_submissions**: Chemical inventory data
- **audit_logs**: System audit trail

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:
- Users can only access their own data
- Managers can view company-wide data
- SuperAdmins have full system access

## User Roles

### Operator
- Submit chemical data
- View own submissions
- Update company profile

### Manager
- All operator permissions
- View all company submissions
- Approve/reject submissions
- View audit logs

### SuperAdmin
- All manager permissions
- View all companies and users
- Full system administration
- Complete audit access

## File Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React contexts (Auth)
├── lib/               # Utilities and Supabase client
├── pages/             # Main application pages
│   ├── LoginPage.tsx
│   ├── CompanyDetailsPage.tsx
│   ├── DataEntryPage.tsx
│   ├── DashboardPage.tsx
│   ├── AdminPage.tsx
│   └── NotFoundPage.tsx
├── App.tsx            # Main app component with routing
└── main.tsx           # Application entry point

supabase/
├── migrations/        # Database migration files
└── seed.sql          # Demo data seed script
```

## Key Features

### Company Profile
- One-time registration after first login
- Company details, contact information, and logo upload
- Required before accessing other features

### Chemical Data Entry
- Comprehensive form with all required fields
- MSDS file upload support
- Real-time validation and error handling

### Dashboard
- Summary statistics and charts
- Advanced filtering options
- CSV export functionality
- Recent submissions table

### Admin Panel
- System-wide oversight
- Submission approval workflow
- User and company management
- Audit log viewing

## Security Features

- **Row Level Security**: Database-level access control
- **Role-based permissions**: Granular access control
- **Audit logging**: Complete action tracking
- **Secure file storage**: Private MSDS file storage
- **Input validation**: Client and server-side validation

## Deployment

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Set environment variables in your hosting platform

### Database (Supabase)
- Already configured and hosted on Supabase
- No additional deployment needed

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Update routing in `src/App.tsx`
4. Add database migrations in `supabase/migrations/`
5. Update types in `src/lib/supabase.ts`

## Troubleshooting

### Common Issues

1. **"new row violates row-level security policy"**
   - Ensure RLS policies are properly set up
   - Check user authentication status
   - Verify user has appropriate role

2. **File upload failures**
   - Check Supabase storage bucket configuration
   - Verify file size limits
   - Ensure proper file permissions

3. **Authentication issues**
   - Verify Supabase URL and keys
   - Check email confirmation status
   - Ensure proper redirect URLs

### Getting Help

1. Check the Supabase dashboard for database issues
2. Review browser console for client-side errors
3. Check network tab for API call failures
4. Verify environment variables are set correctly

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For support and questions, please contact the development team or create an issue in the repository.
