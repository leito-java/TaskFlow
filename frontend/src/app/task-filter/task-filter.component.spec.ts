import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFilter } from '../task.model';
import { TaskFilterComponent } from './task-filter.component';

describe('TaskFilterComponent', () => {
  let fixture: ComponentFixture<TaskFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TaskFilterComponent] });
    fixture = TestBed.createComponent(TaskFilterComponent);
    fixture.componentRef.setInput('activeFilter', 'all');
    fixture.detectChanges();
  });

  it('indique visuellement le filtre actif', () => {
    const activeButton: HTMLButtonElement = fixture.nativeElement.querySelector('button.active');
    expect(activeButton.textContent?.trim()).toBe('Toutes');
  });

  it('émet le filtre sélectionné', () => {
    let selectedFilter: TaskFilter | undefined;
    fixture.componentInstance.filterChanged.subscribe((filter) => selectedFilter = filter);
    const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
    buttons.find((button) => button.textContent?.includes('Terminées'))?.click();
    expect(selectedFilter).toBe('done');
  });
});
