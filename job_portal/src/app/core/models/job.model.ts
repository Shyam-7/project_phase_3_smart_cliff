export interface Job {
  id: string; // Changed from number to string to support UUIDs
  title: string;
  company: string;
  company_name?: string; // Added for job management compatibility
  rating: number;
  reviews: number | null;
  location: string;
  experience: string;
  experience_level?: string; // Added for job management compatibility
  salary?: number; // Added for sorting
  salary_min?: number; // Added for job management compatibility
  salary_max?: number; // Added for job management compatibility
  salaryRange?: string; // Added for display
  postedDate?: string; // Added for sorting
  expires_at?: string; // Added for job management compatibility
  summary: string;
  companyType: string; // Added for company type
  company_type?: string; // Added for job management compatibility (snake_case version)
  company_size?: string; // Added for job management compatibility
  company_rating?: number; // Added for job management compatibility
  company_reviews_count?: number; // Added for job management compatibility
  tags: string[];
  posted: string;
  logo: string | null;
  logoText: string;
  color: string;
  status?: string; // Added for job management compatibility
  remote_allowed?: boolean; // Added for job management compatibility
  skills_required?: string; // Added for job management compatibility
  requirements?: string; // Added for job management compatibility
  benefits?: string; // Added for job management compatibility
  category?: string; // Added for job management compatibility
  employment_type?: string; // Added for job management compatibility
  description: {
    overview: string;
    responsibilities: string[];
    qualifications: string[];
    meta: {
      role: string;
      industry: string;
      department: string;
      employment: string;
      category: string;
      education: {
        UG: string;
        PG: string;
      };
    };
    skills: string[];
  };
}