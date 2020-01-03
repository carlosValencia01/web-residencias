import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentsAdminPageComponent } from './departments-admin-page.component';

describe('DepartmentsAdminPageComponent', () => {
  let component: DepartmentsAdminPageComponent;
  let fixture: ComponentFixture<DepartmentsAdminPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepartmentsAdminPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentsAdminPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
