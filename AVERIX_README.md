# Averix - Turn Hustle Into Math

**Tagline:** Scale What Actually Works

Averix is the first Law-of-Averages intelligence platform built specifically for Cydcor owners and national retail sales teams.

---

## 🚀 **FIRST TIME SETUP REQUIRED**

**👉 See [QUICK_START.md](./QUICK_START.md) for 5-minute setup instructions**

You need to:
1. Run SQL to create database tables (2 min)
2. Create demo users in Supabase (3 min)
3. Login and start using Averix! 🎉

**Alternative:** Full detailed setup guide available in [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## 🎯 What is Averix?

Averix transforms retail sales hustle into mathematical insights. It tracks every step of your sales funnel—from initial stops to closed deals—giving owners and reps real-time visibility into what actually drives revenue.

### Key Value Propositions

- **See Your Office's Real Numbers** - Instant office-wide performance clarity
- **Know exactly how many contacts = a sale** - Math-based insights, not guesswork
- **Compare reps objectively, not emotionally** - Data-driven performance reviews
- **Track store-level ROI** - Identify which retail locations actually convert
- **Coach faster, fire smarter, promote confidently** - Make decisions based on metrics

## 👥 User Roles

### 1. **Owner / Manager**
Full access to all office data with executive dashboards showing:
- Office-wide performance metrics
- Rep leaderboards and comparisons
- Store performance tracking
- LOA funnel analysis
- Revenue trends and forecasting

### 2. **Sales Rep**
Personal performance tracking with:
- Daily entry form (mobile-optimized)
- Individual performance dashboard
- Store history and trends
- Goal tracking
- Personal LOA metrics

### 3. **Cydcor Admin** (Coming Soon)
Multi-office access for enterprise-level insights

## 📊 Core Features

### Executive Dashboard
- **6-Card Metrics Overview**: Contacts, Presentations, Sales, Revenue, Close %, Rev/Contact
- **Production Charts**: Track trends over time by rep, store, or product
- **LOA Funnel Visualization**: See drop-off rates at each stage
- **Rep Leaderboard**: Rankings with comprehensive performance metrics

### Rep Intelligence
- **Performance Comparison**: Volume vs efficiency metrics
- **Individual Rep Detail Views**: Deep dive into each rep's numbers
- **Store Comparison**: See which locations work best for each rep
- **Trend Analysis**: Identify reps who are ramping or stalling

### Store Tracking
- **Store Calendar View**: Visual scheduling and performance tracking
- **Store Performance Cards**: Color-coded by brand (Best Buy = Blue, Target = Red)
- **Key Metrics per Store**:
  - Total contacts
  - Sales conversion
  - Revenue generated
  - Top performing rep
- **Store Performance Pie Chart**: Revenue distribution visualization

### LOA Analyzer
- **Complete Funnel Tracking**:
  1. Total Stops (approaches)
  2. Contacts (stopped to talk)
  3. Presentations (full pitch)
  4. Address Checks
  5. Credit Checks
  6. Sales Closed
  7. Applications Submitted
- **Gap Analysis**: Compare rep performance vs office averages
- **Scenario Planning**: Adjust targets and see projected revenue impact
- **Product Mix Analysis**: Track what products are selling

### Daily Entry (Mobile-Optimized for Reps)
- **Quick Store Selection**: Dropdown of assigned stores
- **Full LOA Input Form**: Every funnel stage tracked
- **Auto-Calculated Metrics**: 
  - Contact rate
  - Presentation rate
  - Close rate
  - Revenue per contact
- **Instant Feedback**: See your numbers as you type
- **Sticky Submit Button**: Easy access on mobile devices

### Reports & Analytics
- **Exportable Reports**: PDF, CSV, and Excel formats
- **Custom Date Ranges**: Analyze any time period
- **Multiple Report Types**:
  - Performance Summary
  - LOA Analysis
  - Store Breakdown
  - Rep Comparison
  - Revenue Reports

## 🔢 Law of Averages (LOA) Explained

The **Law of Averages** is the foundation of predictable sales performance. Averix tracks:

```
Stops → Contacts → Presentations → Address Checks → Credit Checks → Sales
```

### Example LOA Breakdown:
- **100 Stops** (people approached)
- **38 Contacts** (38% contact rate - people who stopped)
- **16 Presentations** (42% presentation rate - from contacts)
- **12 Address Checks** (75% of presentations)
- **8 Credit Checks** (67% of address checks)
- **6 Sales** (75% close rate from credit checks)

**Overall Conversion: 6%** (6 sales from 100 stops)

## 🚀 Getting Started

### Demo Accounts

The application comes with demo accounts pre-configured:

**Owner Account:**
- Email: `owner@olympus.com`
- Password: `demo`
- Access: Full owner dashboard

**Sales Rep Account:**
- Email: `jake@olympus.com`
- Password: `demo`
- Access: Rep dashboard and daily entry

### First Steps for Owners

1. **Login** with your owner credentials
2. **Review Dashboard** - See office-wide metrics
3. **Check Rep Performance** - Navigate to "Reps" tab
4. **Analyze Stores** - View "Stores" tab for location insights
5. **Use LOA Analyzer** - Identify gaps and opportunities
6. **Generate Reports** - Export data for deeper analysis

### First Steps for Reps

1. **Login** with your rep credentials
2. **Submit Daily Entry** - Log today's numbers
3. **View Dashboard** - See your performance trends
4. **Check History** - Review past performance by store
5. **Track Goals** - Monitor progress toward targets

## 📱 Mobile Experience

The rep interface is mobile-first, designed for quick daily entry:
- Large touch-friendly inputs
- Sticky submit button
- Auto-calculated metrics
- Minimal scrolling required
- Offline-ready (coming soon)

## 🎨 Design Philosophy

**Clean SaaS Aesthetic** (Notion / Stripe vibes)
- Dark text on light backgrounds
- Accent colors for performance indicators:
  - 🟢 Green = Above average / positive trend
  - 🟡 Yellow = At average / neutral
  - 🔴 Red = Below average / needs attention
- Color-coded stores by brand
- Clear data hierarchy
- Mobile-first for rep input
- Desktop-first for owner analysis

## 🔐 Data Privacy & Security

- Role-based access control
- Secure authentication
- Data encrypted in transit
- User sessions managed securely
- No data shared between offices without permission

## 🛠️ Technical Stack

- **Frontend**: React + TypeScript
- **UI Components**: Radix UI + Tailwind CSS v4
- **Charts**: Recharts
- **Backend**: Supabase (Edge Functions)
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **Hosting**: Vite build system

## 📈 Roadmap

### Phase 1 (Current)
- ✅ User authentication with role-based access
- ✅ Owner dashboard with key metrics
- ✅ Rep dashboard and daily entry
- ✅ Store tracking and visualization
- ✅ LOA analyzer with gap analysis
- ✅ Basic reports

### Phase 2 (Coming Soon)
- 🔄 Backend integration with Supabase
- 🔄 Real data persistence
- 🔄 Multi-office support for Cydcor admins
- 🔄 Mobile app (React Native)
- 🔄 Automated coaching insights
- 🔄 Goal-setting workflows
- 🔄 Team collaboration features

### Phase 3 (Future)
- 📅 Predictive analytics
- 📅 AI-powered coaching recommendations
- 📅 Integration with CRM systems
- 📅 Automated reporting schedules
- 📅 Real-time notifications
- 📅 Gamification and leaderboards

## 💡 Best Practices

### For Owners:
1. **Review daily** - Check dashboard every morning
2. **Weekly 1-on-1s** - Use LOA data for coaching sessions
3. **Monthly deep-dives** - Analyze trends and adjust strategy
4. **Store optimization** - Rotate reps to high-performing stores
5. **Celebrate wins** - Recognize top performers publicly

### For Reps:
1. **Log daily** - Enter numbers at end of each shift
2. **Be honest** - Accurate data = better coaching
3. **Track trends** - Notice what works for YOU
4. **Set goals** - Use dashboard to monitor progress
5. **Ask questions** - Use your data in coaching sessions

## 📞 Support

For questions, feature requests, or technical support:
- Email: support@averix.app (coming soon)
- In-app chat: Click the help icon (coming soon)

## 📄 License

Proprietary - Built specifically for Cydcor offices and authorized retail sales teams.

---

**Turn Hustle Into Math. Scale What Actually Works.**