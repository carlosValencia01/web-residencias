import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCreateCourseComponent } from './form-create-course.component';

describe('FormCreateCourseComponent', () => {
  let component: FormCreateCourseComponent;
  let fixture: ComponentFixture<FormCreateCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormCreateCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCreateCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
