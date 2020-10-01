import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlStudentApprovedRequestsComponent } from './control-student-approved-requests.component';

describe('ControlStudentApprovedRequestsComponent', () => {
  let component: ControlStudentApprovedRequestsComponent;
  let fixture: ComponentFixture<ControlStudentApprovedRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlStudentApprovedRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlStudentApprovedRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
