import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlStudentAttendanceComponent } from './control-student-attendance.component';

describe('ControlStudentAttendanceComponent', () => {
  let component: ControlStudentAttendanceComponent;
  let fixture: ComponentFixture<ControlStudentAttendanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlStudentAttendanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlStudentAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
