import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Project, ProjectIcon } from './task.model';
export interface ProjectDraft { name: string; icon: ProjectIcon; color: string; }
@Injectable({ providedIn: 'root' })
export class ProjectApiService {
  private readonly http = inject(HttpClient);
  getProjects(): Observable<Project[]> { return this.http.get<Project[]>('/api/projects'); }
  createProject(draft: ProjectDraft): Observable<Project> { return this.http.post<Project>('/api/projects', draft); }
}
