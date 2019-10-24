import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterStudentPageComponent } from './register-student-page.component';

describe('RegisterStudentPageComponent', () => {
  let component: RegisterStudentPageComponent;
  let fixture: ComponentFixture<RegisterStudentPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterStudentPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterStudentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
