import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeStudentPageComponent } from './resume-student-page.component';

describe('ResumeStudentPageComponent', () => {
  let component: ResumeStudentPageComponent;
  let fixture: ComponentFixture<ResumeStudentPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResumeStudentPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResumeStudentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
