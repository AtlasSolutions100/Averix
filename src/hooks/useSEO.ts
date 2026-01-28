import { useEffect } from 'react';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

/**
 * Custom hook to manage SEO metadata for each page
 */
export function useSEO(config: SEOConfig) {
  useEffect(() => {
    // Update document title
    document.title = config.title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.content = content;
    };

    // Standard meta tags
    updateMetaTag('description', config.description);
    if (config.keywords) {
      updateMetaTag('keywords', config.keywords);
    }

    // Open Graph tags
    updateMetaTag('og:title', config.ogTitle || config.title, true);
    updateMetaTag('og:description', config.ogDescription || config.description, true);
    updateMetaTag('og:type', 'website', true);
    if (config.ogImage) {
      updateMetaTag('og:image', config.ogImage, true);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', config.ogTitle || config.title);
    updateMetaTag('twitter:description', config.ogDescription || config.description);
    if (config.ogImage) {
      updateMetaTag('twitter:image', config.ogImage);
    }

    // Cleanup function (optional - keeps last SEO when unmounting)
    return () => {
      // We don't remove tags to avoid flickering between pages
    };
  }, [config.title, config.description, config.keywords, config.ogTitle, config.ogDescription, config.ogImage]);
}

// SEO configurations for each page
export const SEO_CONFIGS = {
  home: {
    title: 'Veridex | Sales Performance & Law of Averages Analytics',
    description: 'Track Law of Averages, rep performance, and store efficiency with Veridex — a data-driven sales performance platform.',
    keywords: 'Law of Averages sales, Sales performance tracking software, Sales rep analytics, Retail sales performance dashboard, Sales office management software',
  },
  
  login: {
    title: 'Login | Veridex Sales Performance Dashboard',
    description: 'Access your Veridex dashboard to track sales performance, Law of Averages, and rep metrics in real-time.',
    keywords: 'Sales dashboard login, Sales performance tracking, Sales analytics login',
  },
  
  signup: {
    title: 'Sign Up | Veridex Sales Performance Platform',
    description: 'Create your Veridex account and start tracking Law of Averages, rep performance, and sales efficiency today.',
    keywords: 'Sales tracking software signup, Sales performance platform, Sales analytics registration',
  },
  
  ownerDashboard: {
    title: 'Office Dashboard | Veridex Sales Performance Analytics',
    description: 'Monitor office-wide sales performance, rep leaderboards, LOA metrics, and conversion rates with powerful analytics.',
    keywords: 'Sales office management, Sales performance dashboard, Rep leaderboard, Sales KPIs dashboard, Office sales analytics',
  },
  
  repDashboard: {
    title: 'Rep Dashboard | Veridex Sales Performance Tracker',
    description: 'Track your daily sales performance, Law of Averages, personal goals, and store production metrics.',
    keywords: 'Sales rep dashboard, Personal sales tracking, Sales performance metrics, Daily sales tracker, Rep analytics',
  },
  
  loaAnalyzer: {
    title: 'LOA Analyzer | Veridex Law of Averages Analytics',
    description: 'Analyze Law of Averages metrics, identify conversion gaps, and get data-driven coaching insights.',
    keywords: 'Law of Averages analytics, Sales coaching analytics, Conversion rate analysis, Sales funnel optimization',
  },
  
  stores: {
    title: 'Store Performance | Veridex Retail Analytics Dashboard',
    description: 'Track store visits, performance metrics, revenue by location, and optimize rep-store assignments.',
    keywords: 'Store performance tracking, Retail sales analytics, Store conversion tracking, Multi-location sales tracking',
  },
  
  reps: {
    title: 'Rep Management | Veridex Sales Team Analytics',
    description: 'Manage your sales team, track rep performance, view detailed metrics, and compare productivity.',
    keywords: 'Sales rep management, Sales team analytics, Rep performance tracking, Team productivity metrics',
  },
  
  goals: {
    title: 'Goals & Targets | Veridex Sales Performance Goals',
    description: 'Set sales goals, track progress, and measure team performance against targets.',
    keywords: 'Sales goal setting, Sales target tracking, Performance goals, Sales objectives',
  },
  
  teamManagement: {
    title: 'Team Management | Veridex Sales Office Management',
    description: 'Create and manage team member accounts, set permissions, and organize your sales office.',
    keywords: 'Sales team management, Sales office administration, User management, Team organization',
  },
  
  storeManagement: {
    title: 'Store Management | Veridex Location Management',
    description: 'Add, edit, and manage retail locations. Track which stores your reps visit and monitor performance.',
    keywords: 'Store management software, Retail location tracking, Store database management',
  },
  
  officeSettings: {
    title: 'Office Settings | Veridex Configuration',
    description: 'Configure your office settings, preferences, and customize your Veridex dashboard.',
    keywords: 'Sales dashboard settings, Office configuration, Dashboard customization',
  },
  
  entries: {
    title: 'Daily Entries | Veridex Sales Activity Tracking',
    description: 'Review all daily performance submissions, LOA data, and sales activity from your team.',
    keywords: 'Daily sales tracking, Sales activity log, Performance submissions, Sales data entry',
  },
  
  liveTracker: {
    title: 'Live Tracker | Veridex Real-Time Sales Counter',
    description: 'Track your Law of Averages in real-time with a live counter for contacts, presentations, and sales.',
    keywords: 'Real-time sales tracking, Live sales counter, LOA tracker, Daily sales counter, Field sales tracker',
  },
  
  dailyEntry: {
    title: 'Daily Entry | Veridex Sales Performance Input',
    description: 'Submit your daily sales performance, LOA metrics, store data, and track your progress.',
    keywords: 'Daily sales entry, Performance data input, Sales logging, LOA data entry',
  },
  
  history: {
    title: 'Rep History | Veridex Performance History',
    description: 'View your complete sales history, past store locations, and long-term performance trends.',
    keywords: 'Sales history, Performance history, Historical sales data, Sales trends',
  },
  
  reports: {
    title: 'Reports | Veridex Sales Analytics & Reporting',
    description: 'Generate detailed sales reports, export data, and analyze performance trends.',
    keywords: 'Sales reports, Performance reports, Sales analytics, Data export, Sales reporting',
  },
  
  storePerformance: {
    title: 'Store Performance | Veridex Retail Sales Analytics',
    description: 'Visualize store performance with revenue distribution charts, sales metrics, and location comparisons.',
    keywords: 'Store analytics, Retail performance metrics, Store sales tracking, Location performance, Store revenue analysis',
  },
};
