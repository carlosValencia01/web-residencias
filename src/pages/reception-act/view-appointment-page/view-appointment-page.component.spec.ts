import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAppointmentPageComponent } from './view-appointment-page.component';

describe('ViewAppointmentPageComponent', () => {
  let component: ViewAppointmentPageComponent;
  let fixture: ComponentFixture<ViewAppointmentPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAppointmentPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAppointmentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
