import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAdviserComponent } from './employee-adviser.component';

describe('EmployeeAdviserComponent', () => {
  let component: EmployeeAdviserComponent;
  let fixture: ComponentFixture<EmployeeAdviserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeAdviserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeAdviserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
