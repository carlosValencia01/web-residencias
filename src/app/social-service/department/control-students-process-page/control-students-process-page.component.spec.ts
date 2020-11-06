import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlStudentsProcessPageComponent } from './control-students-process-page.component';

describe('ControlStudentsProcessPageComponent', () => {
  let component: ControlStudentsProcessPageComponent;
  let fixture: ComponentFixture<ControlStudentsProcessPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlStudentsProcessPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlStudentsProcessPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
