import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Project, ProjectIcon } from './task.model';
export interface ProjectDraft { name: string; icon: ProjectIcon; color: string; }
@Injectable({ providedIn: 'root' })
export class ProjectApiService {
  private readonly http = inject(HttpClient);
  private readonly projectState = signal<Project[]>([]);
  readonly projects = this.projectState.asReadonly();

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>('/api/projects').pipe(tap((projects) => this.projectState.set(projects)));
  }

  createProject(draft: ProjectDraft): Observable<Project> {
    return this.http.post<Project>('/api/projects', draft).pipe(
      tap((project) => this.projectState.update((projects) => [...projects.filter((item) => item.id !== project.id), project])),
    );
  }
}
