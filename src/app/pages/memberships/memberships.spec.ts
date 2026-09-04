import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Memberships } from './memberships';

describe('Memberships', () => {
  let component: Memberships;
  let fixture: ComponentFixture<Memberships>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Memberships],
    }).compileComponents();

    fixture = TestBed.createComponent(Memberships);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
