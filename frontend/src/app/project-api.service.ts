import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from './task.model';
@Injectable({ providedIn: 'root' })
export class ProjectApiService {
  private readonly http = inject(HttpClient);
  getProjects(): Observable<Project[]> { return this.http.get<Project[]>('/api/projects'); }
  createProject(name: string): Observable<Project> { return this.http.post<Project>('/api/projects', { name }); }
}
