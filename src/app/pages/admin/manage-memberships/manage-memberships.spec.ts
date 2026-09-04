import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMemberships } from './manage-memberships';

describe('ManageMemberships', () => {
  let component: ManageMemberships;
  let fixture: ComponentFixture<ManageMemberships>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageMemberships],
    }).compileComponents();

    fixture = TestBed.createComponent(ManageMemberships);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
