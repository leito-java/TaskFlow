import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { DailyPriorityApiService } from './daily-priority-api.service';

describe('DailyPriorityApiService', () => {
  let service: DailyPriorityApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DailyPriorityApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DailyPriorityApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('charge les suggestions inachevées de la veille', () => {
    const expected = [{ taskId: 7, title: 'Préparer la réunion', previousDate: '2026-08-28' }];

    service.getSuggestions().subscribe((suggestions) => expect(suggestions).toEqual(expected));

    const request = http.expectOne('/api/daily-priorities/suggestions');
    expect(request.request.method).toBe('GET');
    request.flush(expected);
  });
});
