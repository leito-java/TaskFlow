import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface DailyPriority {
  id: number;
  taskId: number;
  title: string;
  position: number;
}

@Injectable({ providedIn: 'root' })
export class DailyPriorityApiService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/daily-priorities';

  getToday(): Observable<DailyPriority[]> { return this.http.get<DailyPriority[]>(this.endpoint); }
  add(taskId: number): Observable<DailyPriority> { return this.http.post<DailyPriority>(this.endpoint, { taskId }); }
  remove(taskId: number): Observable<void> { return this.http.delete<void>(`${this.endpoint}/${taskId}`); }
}
