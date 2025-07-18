import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Job } from '../models/job.model';
import { JobApplication } from '../models/job-application.model';
import { Observable, catchError, map, of, switchMap, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = 'http://localhost:3000/jobs';
  private applicationsUrl = 'http://localhost:3000/applications';

  constructor(private http: HttpClient) { }

  getJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(this.apiUrl).pipe(
      map(jobs => jobs.map(job => ({
        ...job,
        postedDate: job.postedDate || new Date().toISOString()
      }))),
      catchError(error => {
        console.error('Error fetching jobs:', error);
        return of([]);
      })
    );
  }

  getJobById(id: number): Observable<Job | undefined> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching job ${id}:`, error);
        return of(undefined);
      })
    );
  }

  addJob(job: Job): Observable<Job> {
    return this.http.post<Job>(this.apiUrl, job).pipe(
      catchError(error => {
        console.error('Error adding job:', error);
        throw error;
      })
    );
  }

  updateJob(job: Job): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${job.id}`, job).pipe(
      catchError(error => {
        console.error(`Error updating job ${job.id}:`, error);
        throw error;
      })
    );
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error deleting job ${id}:`, error);
        throw error;
      })
    );
  }

  filterJobs(query: string, location: string): Job[] {
    // This will now be called after jobs are loaded
    return []; // We'll modify this
  }

  // Application related methods
  applyToJob(application: JobApplication): Observable<JobApplication> {
    return this.http.post<JobApplication>(this.applicationsUrl, application).pipe(
      catchError(error => {
        console.error('Error applying to job:', error);
        throw error;
      })
    );
  }

  getUserApplications(userId: number): Observable<{application: JobApplication, job: Job}[]> {
    return this.http.get<JobApplication[]>(`${this.applicationsUrl}?userId=${userId}`).pipe(
      switchMap(applications => {
        if (applications.length === 0) {
          return of([]);
        }
        
        // Get job details for each application
        const jobRequests = applications.map(application => 
          this.getJobById(+application.jobId).pipe(
            map(job => ({ application, job: job! }))
          )
        );
        
        return forkJoin(jobRequests);
      }),
      catchError(error => {
        console.error('Error fetching user applications:', error);
        return of([]);
      })
    );
  }

  withdrawApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.applicationsUrl}/${id}`).pipe(
      catchError(error => {
        console.error(`Error withdrawing application ${id}:`, error);
        throw error;
      })
    );
  }

  // Upload resume file (mock implementation)
  uploadResume(file: File): Observable<{path: string}> {
    // In a real application, this would upload to a file server
    // For now, we'll just return a mock path
    const mockPath = `uploads/resumes/${Date.now()}_${file.name}`;
    return of({ path: mockPath });
  }

}
  
  // {
  //     id: 1,
  //     title: "Software Engineering Technical Leader - C/Python/Go",
  //     company: "Cisco",
  //     rating: 4.2,
  //     reviews: 1951,
  //     location: "Bengaluru",
  //     experience: "12-17 Yrs",
  //     summary: "5+ years validated experience in system design, development and delivery...",
  //     tags: ["Software Engineering", "Java", "Azure", "C++", "API Services", "C", "GO", "HTTP"],
  //     posted: "1 day ago",
  //     logo: null,
  //     logoText: "C",
  //     salary: 2500000,
  //     color: "bg-blue-500",
  //     description: {
  //       overview: "Lead complex software systems with a focus on high performance and scalability using C, Python, and Go. Architect, mentor, and deliver cutting-edge backend platforms for enterprise-grade applications.",
  //       responsibilities: [
  //         "Design and implement scalable backend systems.",
  //         "Lead architecture discussions and code reviews.",
  //         "Mentor junior developers and set coding standards.",
  //         "Coordinate with DevOps, QA, and Product teams.",
  //         "Optimize system performance for high traffic loads."
  //       ],
  //       qualifications: [
  //         "12+ years experience in backend development.",
  //         "Strong command of C, Python, Go.",
  //         "Experience in distributed systems and microservices.",
  //         "Bachelor's or Master's in Computer Science."
  //       ],
  //       meta: {
  //         role: "Tech Lead - Engineering",
  //         industry: "Networking / Telecommunications",
  //         department: "Software Engineering",
  //         employment: "Full Time, Permanent",
  //         category: "Software Development",
  //         education: {
  //           UG: "B.Tech/BE",
  //           PG: "Any Postgraduate"
  //         }
  //       },
  //       skills: ["C", "Python", "Go", "Microservices", "Leadership", "DevOps"]
  //     }
  //   },
  //   {
  //   id: 2,
  //   title: "Frontend Developer - Angular",
  //   company: "Google",
  //   rating: 4.5,
  //   reviews: 3421,
  //   location: "Hyderabad",
  //   experience: "5-8 Yrs",
  //   summary: "Build responsive web applications using Angular framework...",
  //   tags: ["Angular", "TypeScript", "HTML", "CSS", "JavaScript"],
  //   posted: "2 days ago",
  //   logo: null,
  //   logoText: "G",
  //   salary: 1500000,
  //   color: "bg-red-500",
  //   description: {
  //     overview: "Develop and maintain high-quality web applications using Angular framework.",
  //     responsibilities: [
  //       "Develop user interfaces with Angular",
  //       "Optimize application performance",
  //       "Collaborate with UX designers"
  //     ],
  //     qualifications: [
  //       "5+ years experience with Angular",
  //       "Strong JavaScript/TypeScript skills",
  //       "Bachelor's in Computer Science"
  //     ],
  //     meta: {
  //       role: "Frontend Developer",
  //       industry: "Technology",
  //       department: "Engineering",
  //       employment: "Full Time",
  //       category: "Web Development",
  //       education: {
  //         UG: "B.Tech/BE",
  //         PG: "Any Postgraduate"
  //       }
  //     },
  //     skills: ["Angular", "TypeScript", "HTML", "CSS"]
  //   }
  // },
  // {
  //   id: 3,
  //   title: "DevOps Engineer",
  //   company: "Amazon",
  //   rating: 4.0,
  //   reviews: 2893,
  //   location: "Bengaluru",
  //   experience: "3-6 Yrs",
  //   summary: "Implement CI/CD pipelines and cloud infrastructure...",
  //   tags: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform"],
  //   posted: "3 days ago",
  //   logo: null,
  //   salary: 1200000,
  //   logoText: "A",
  //   color: "bg-yellow-500",
  //   description: {
  //     overview: "Design and maintain cloud infrastructure and deployment pipelines.",
  //     responsibilities: [
  //       "Implement CI/CD pipelines",
  //       "Manage AWS infrastructure",
  //       "Automate deployment processes"
  //     ],
  //     qualifications: [
  //       "3+ years DevOps experience",
  //       "AWS certification preferred",
  //       "Bachelor's in Computer Science"
  //     ],
  //     meta: {
  //       role: "DevOps Engineer",
  //       industry: "E-commerce",
  //       department: "Operations",
  //       employment: "Full Time",
  //       category: "Cloud Computing",
  //       education: {
  //         UG: "B.Tech/BE",
  //         PG: "Any Postgraduate"
  //       }
  //     },
  //     skills: ["AWS", "Docker", "Kubernetes", "CI/CD"]
  //   }
  // }