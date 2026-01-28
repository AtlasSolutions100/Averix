# Averix - Law of Averages Intelligence Platform

**Tagline:** Turn Hustle Into Math. Scale What Actually Works.

The first Law-of-Averages intelligence platform built specifically for Cydcor owners and national retail sales teams.

---

## 🚨 **SETUP REQUIRED - READ THIS FIRST**

Your app won't work until you set up the database and create demo users.

**👉 See [START_HERE.md](./START_HERE.md) for complete setup instructions (5 minutes)**

### 🔥 Common Errors & Quick Fixes:
- **"Invalid login credentials"** → [QUICK_START.md](./QUICK_START.md) - Create demo users
- **"Failed to fetch user"** → [FIX_FAILED_TO_FETCH_USER.md](./FIX_FAILED_TO_FETCH_USER.md) - 2-minute fix
- **Need SQL commands?** → [SQL_CHEAT_SHEET.md](./SQL_CHEAT_SHEET.md) - Copy & paste

### 📚 Setup Guides:
- **[START_HERE.md](./START_HERE.md)** ⭐ What you need to do right now
- **[QUICK_START.md](./QUICK_START.md)** - Fast 5-minute setup
- **[HOW_TO_RUN_SQL.md](./HOW_TO_RUN_SQL.md)** - Visual guide for SQL
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed step-by-step
- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - All guides organized

---

## 🎯 What is Averix?

Averix transforms retail sales into data-driven decisions by tracking every step of your sales funnel:

**Stops → Contacts → Presentations → Address Checks → Credit Checks → Sales**

### Key Features

- 📊 **Executive Dashboard** - Instant office-wide performance clarity
- 👤 **Rep Intelligence** - Volume vs efficiency analysis  
- 🏬 **Store Tracking** - Which retail locations actually convert
- 📈 **LOA Analyzer** - Math-based coaching instead of "try harder"
- 📱 **Mobile-First Rep Entry** - Quick daily logging on any device
- 📅 **Historical Trends** - See growth, stagnation, and ramp curves

---

## 🚀 Quick Start

### Prerequisites

- Supabase account (already configured)
- Project ID: `xyeoogvecvmbuvoczuva`

### Installation

**1. Set Up Database (5 minutes)**

```bash
# 1. Go to Supabase SQL Editor
https://supabase.com/dashboard/project/xyeoogvecvmbuvoczuva/sql

# 2. Copy contents of DATABASE_SCHEMA.sql
# 3. Paste and run in SQL Editor
# 4. Verify: You should see "Success. No rows returned"
```

**2. Create Demo Users (5 minutes)**

Follow instructions in `/SETUP_GUIDE.md` or `/CREATE_DEMO_USERS.sql`

**3. Login & Test**

```
Owner: owner@olympus.com / demo123
Rep: jake@olympus.com / demo123
```

**Full setup guide:** See `/SETUP_GUIDE.md` for detailed instructions

---

## 📁 Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx                    # Main app with auth routing
│   │   └── components/
│   │       ├── LoginPage.tsx          # Authentication
│   │       ├── OwnerLayout.tsx        # Owner dashboard shell
│   │       ├── RepLayout.tsx          # Rep mobile-first layout
│   │       ├── DailyEntryView.tsx     # Rep daily entry form
│   │       ├── OwnerDashboardView.tsx # Office metrics
│   │       ├── RepsView.tsx           # Rep performance table
│   │       ├── StoresView.tsx         # Store tracking
│   │       └── LOAAnalyzerView.tsx    # Funnel analysis
│   ├── services/
│   │   └── api.ts                     # API service layer
│   └── styles/
├── supabase/functions/server/
│   ├── index.tsx                      # Backend API endpoints
│   └── kv_store.tsx                   # Key-value utilities
├── DATABASE_SCHEMA.sql                # Complete DB schema
├── CREATE_DEMO_USERS.sql              # Quick user creation
├── SETUP_GUIDE.md                     # Step-by-step setup
├── IMPLEMENTATION_ROADMAP.md          # Development plan
└── AVERIX_README.md                   # Product documentation
```

---

## 🔐 Authentication & Roles

### User Roles

1. **Owner** - Full access to all office data
   - View all rep performance
   - Office-wide analytics
   - Rep leaderboards
   - Store performance comparison

2. **Rep** - Personal performance tracking
   - Daily entry submission
   - Personal metrics dashboard
   - Store history
   - Goal tracking

3. **Cydcor Admin** - Multi-office access (coming soon)

### Security

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication via Supabase
- Users can only access data in their office
- Reps can only see own entries; owners see all

---

## 📊 Core Metrics Tracked

### Law of Averages Funnel

1. **Stops** - How many people approached
2. **Contacts** - How many stopped to talk
3. **Presentations** - How many received full pitch
4. **Address Checks** - How many verified address
5. **Credit Checks** - How many ran credit
6. **Sales** - How many closed
7. **Applications** - Total applications submitted

### Calculated Metrics

- **Contact Rate** = Contacts / Stops
- **Presentation Rate** = Presentations / Contacts  
- **Close Rate** = Sales / Contacts
- **Revenue per Contact** = Total Revenue / Contacts
- **Average Sale Value** = Revenue / Sales

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Radix UI** for components
- **Recharts** for data visualization
- **Sonner** for notifications

### Backend
- **Supabase** for backend-as-a-service
- **PostgreSQL** database
- **Deno Edge Functions** for serverless API
- **Hono** web framework

### Authentication
- **Supabase Auth** with JWT tokens
- **Row Level Security** for data isolation

---

## 📱 Mobile Experience

The rep interface is mobile-first:

- ✅ Touch-friendly large inputs
- ✅ Sticky submit button
- ✅ Auto-calculated metrics
- ✅ Minimal scrolling
- ✅ Responsive layout
- ✅ Works offline (coming soon)

---

## 🎨 Design System

**Color Palette:**
- Primary Blue: `#3b82f6`
- Best Buy: `#3b82f6` (Blue)
- Target: `#dc2626` (Red)
- Success: `#10b981` (Green)
- Warning: `#f59e0b` (Orange)

**Typography:**
- Clean, modern sans-serif
- Hierarchy: Metrics > Labels > Descriptions

**Layout:**
- Desktop: Sidebar navigation + main content
- Mobile: Bottom tab navigation

---

## 🔄 API Endpoints

### Authentication
```
POST   /auth/signup          Create new user
GET    /auth/me              Get current user profile
```

### Daily Entries
```
POST   /entries              Submit daily entry
GET    /entries/user/:userId Get user's entries
```

### Analytics
```
GET    /analytics/office/:officeId     Office-wide metrics
GET    /analytics/leaderboard/:officeId Rep rankings
GET    /analytics/store/:storeId        Store performance
```

### Stores
```
GET    /stores               Get stores for office
```

### Users
```
GET    /users                Get users in office (owner only)
```

Full API documentation in server code: `/supabase/functions/server/index.tsx`

---

## 📈 Roadmap

### Phase 1: Core Features ✅
- [x] User authentication
- [x] Daily entry submission
- [x] Office analytics
- [x] Rep leaderboards
- [x] Store tracking
- [x] LOA funnel analysis

### Phase 2: Enhanced Analytics (Next)
- [ ] Real-time dashboard updates
- [ ] Goal tracking & progress
- [ ] Predictive analytics
- [ ] Store ROI analysis
- [ ] Rep efficiency scoring

### Phase 3: Advanced Features
- [ ] Mobile app (React Native)
- [ ] Automated coaching insights
- [ ] Email reports
- [ ] CRM integration
- [ ] Multi-office support for Cydcor admins

### Phase 4: Enterprise
- [ ] API for third-party integrations
- [ ] Advanced reporting
- [ ] Custom dashboards
- [ ] White-label options

---

## 🐛 Troubleshooting

### Common Issues

**Problem: "Login Failed"**
- Verify user exists in Supabase Auth
- Check user_profiles table has matching entry
- Ensure passwords are correct

**Problem: "Failed to load stores"**
- Run DATABASE_SCHEMA.sql to create sample stores
- Verify office_id matches between tables

**Problem: "Database connection error"**
- Check Supabase project is active
- Verify environment variables

See `/SETUP_GUIDE.md` for detailed troubleshooting

---

## 📞 Support

For setup assistance:
1. Check `/SETUP_GUIDE.md`
2. Review `/IMPLEMENTATION_ROADMAP.md`
3. Check browser console for errors (F12)
4. Verify Supabase logs in dashboard

---

## 📄 License

Proprietary - Built for Cydcor offices and authorized retail sales teams.

---

## 🎉 Success Criteria

After setup, you should be able to:

✅ Login as owner or rep  
✅ Submit daily entries as rep  
✅ View office-wide analytics as owner  
✅ See rep leaderboard rankings  
✅ Track store performance  
✅ Analyze LOA conversion rates  
✅ View historical trends  

**All data persists in Supabase!**

---

## 🚀 Getting Started

1. **Read** `/SETUP_GUIDE.md`
2. **Run** `DATABASE_SCHEMA.sql` in Supabase
3. **Create** demo users
4. **Login** and start tracking!

**Turn Hustle Into Math. Scale What Actually Works.** 🎯

---

Built with ❤️ for Cydcor sales teams