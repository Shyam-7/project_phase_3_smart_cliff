export interface Job {
  id: string; // UUID
  title: string;
  company?: string; // For backward compatibility
  company_name?: string; // Database field
  rating?: number; // For backward compatibility
  company_rating?: number; // Database field
  reviews?: number | null; // For backward compatibility
  company_reviews_count?: number; // Database field
  location?: string;
  experience?: string; // For backward compatibility
  experience_level?: string; // Database field
  employment_type?: string; // Database field (Full-time, Part-time, etc.)
  category?: string; // Database field
  status?: string; // Database field (active, inactive, etc.)
  salary?: number; // For backward compatibility
  salary_min?: number; // Database field in LPA
  salary_max?: number; // Database field in LPA
  salary_currency?: string; // Database field
  salaryRange?: string; // For display
  postedDate?: string; // For sorting
  created_at?: string; // Database field
  updated_at?: string; // Database field
  expires_at?: string | null; // Database field
  summary?: string;
  description?: string | any; // Can be string (database) or object (frontend)
  requirements?: string; // Database field
  companyType?: string; // For backward compatibility
  company_type?: string; // Database field
  company_size?: string; // Database field
  tags?: string[]; // For backward compatibility
  skills_required?: string; // Database field
  benefits?: string; // Database field
  posted?: string; // For backward compatibility
  posted_by?: string; // Database field - user ID who posted
  views?: number; // Database field
  remote_allowed?: boolean; // Database field
  logo?: string | null; // For backward compatibility
  logoText?: string; // For backward compatibility
  color?: string; // For backward compatibility
  // Legacy description object structure for backward compatibility
  meta?: {
    role?: string;
    industry?: string;
    department?: string;
    employment?: string;
    education?: {
      UG?: string;
      PG?: string;
    };
  };
  responsibilities?: string[];
  qualifications?: string[];
  skills?: string[];
}