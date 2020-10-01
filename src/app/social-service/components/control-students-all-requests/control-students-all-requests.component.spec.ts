import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlStudentsAllRequestsComponent } from './control-students-all-requests.component';

describe('ControlStudentsAllRequestsComponent', () => {
  let component: ControlStudentsAllRequestsComponent;
  let fixture: ComponentFixture<ControlStudentsAllRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlStudentsAllRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlStudentsAllRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
