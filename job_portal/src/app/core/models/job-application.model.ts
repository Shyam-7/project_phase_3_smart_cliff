export interface JobApplication {
  id?: number; // Optional for new applications
  jobId: string; // Changed from number to string to support UUIDs
  userId: number;
  applicationDate: string;
  status: 'Applied' | 'Under Review' | 'Interview' | 'Rejected' | 'Accepted' | 'Withdrawn';
  fullName?: string;
  email?: string;
  phone?: string;
  coverLetter?: string;
  resumePath?: string; // Store file path if uploaded
  quickApply?: boolean;
}