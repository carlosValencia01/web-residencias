import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlStudentsSignedRequestsComponent } from './control-students-signed-requests.component';

describe('ControlStudentsSignedRequestsComponent', () => {
  let component: ControlStudentsSignedRequestsComponent;
  let fixture: ComponentFixture<ControlStudentsSignedRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlStudentsSignedRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlStudentsSignedRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
