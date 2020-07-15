import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormRequestCourseComponent } from './form-request-course.component';

describe('FormRequestCourseComponent', () => {
  let component: FormRequestCourseComponent;
  let fixture: ComponentFixture<FormRequestCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormRequestCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormRequestCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
