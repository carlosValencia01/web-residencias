import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlStudentsRequestsComponent } from './control-students-requests.component';

describe('ControlStudentsRequestsComponent', () => {
  let component: ControlStudentsRequestsComponent;
  let fixture: ComponentFixture<ControlStudentsRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlStudentsRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlStudentsRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
