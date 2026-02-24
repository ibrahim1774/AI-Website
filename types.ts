
export interface ServiceCard {
  title: string;
  description: string;
  icon: string;
}

export interface DetailedServiceCard {
  title: string;
  description: string;
  icon: string;
}

export interface Differentiator {
  title: string;
  description: string;
}

export interface GeneratedSiteData {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    heroImage: string;
  };
  trust: {
    headline: string;
    paragraph: string;
    bullets: string[];
    ctaText: string;
    image: string;
  };
  servicesOverview: {
    headline: string;
    cards: ServiceCard[];
  };
  valueBanner: {
    headline: string;
    subheadline: string;
    ctaText: string;
  };
  detailedServices: {
    headline: string;
    cards: DetailedServiceCard[];
  };
  emergency: {
    headline: string;
    paragraph: string;
    ctaText: string;
  };
  whyChooseUs: {
    headline: string;
    paragraph: string;
    differentiators: Differentiator[];
    image: string;
  };
  finalCta: {
    headline: string;
    subheadline: string;
    ctaText: string;
  };
  contact: {
    phone: string;
    location: string;
    companyName: string;
  };
}

export interface SiteInstance {
  id: string;
  data: GeneratedSiteData;
  lastSaved: number;
  user_id?: string;
  formInputs?: GeneratorInputs;
  deployedUrl?: string;
  deploymentStatus?: 'draft' | 'deployed';
  customDomain?: string;
  domainOrderId?: string;
}

export interface GeneratorInputs {
  industry: string;
  companyName: string;
  location: string;
  phone: string;
  brandColor: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  stripe_customer_id: string | null;
  subscription_status: 'none' | 'active' | 'past_due' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export type AppView = 'generator' | 'editor' | 'dashboard';
