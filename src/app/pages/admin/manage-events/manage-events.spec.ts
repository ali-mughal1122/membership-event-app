import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ManageEvents } from './manage-events';

describe('ManageEvents', () => {
  let component: ManageEvents;
  let fixture: ComponentFixture<ManageEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageEvents],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageEvents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
