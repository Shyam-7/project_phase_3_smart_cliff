export interface Job {
  id: number;
  title: string;
  company: string;
  rating: number;
  reviews: number | null;
  location: string;
  experience: string;
  salary?: number; // Added for sorting
  postedDate?: string; // Added for sorting
  summary: string;
  companyType: string; // Added for company type
  tags: string[];
  posted: string;
  logo: string | null;
  logoText: string;
  color: string;
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