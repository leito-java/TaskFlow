import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Task, TaskDraft } from './task.model';

export type TaskUpdate = TaskDraft;

/** Unique porte d'entrée HTTP du frontend pour la ressource /api/tasks. */
@Injectable({ providedIn: 'root' })
export class TaskApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/tasks';

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.endpoint);
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.endpoint}/${id}`);
  }

  createTask(draft: TaskDraft): Observable<Task> {
    return this.http.post<Task>(this.endpoint, draft);
  }

  updateTask(id: number, update: TaskUpdate): Observable<Task> {
    return this.http.put<Task>(`${this.endpoint}/${id}`, update);
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  markReminderRead(id: number): Observable<Task> {
    return this.http.patch<Task>(`${this.endpoint}/${id}/reminder/read`, {});
  }

  snoozeReminder(id: number, minutes: number): Observable<Task> {
    return this.http.patch<Task>(`${this.endpoint}/${id}/reminder/snooze`, { minutes });
  }
}
