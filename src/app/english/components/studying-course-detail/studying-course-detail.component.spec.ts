import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyingCourseDetailComponent } from './studying-course-detail.component';

describe('StudyingCourseDetailComponent', () => {
  let component: StudyingCourseDetailComponent;
  let fixture: ComponentFixture<StudyingCourseDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudyingCourseDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyingCourseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
