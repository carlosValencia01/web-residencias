import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentControlStudentsPresentationComponent } from './department-control-students-presentation.component';

describe('DepartmentControlStudentsPresentationComponent', () => {
  let component: DepartmentControlStudentsPresentationComponent;
  let fixture: ComponentFixture<DepartmentControlStudentsPresentationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepartmentControlStudentsPresentationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentControlStudentsPresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
