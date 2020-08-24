import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignEnglishTeacherComponent } from './assign-english-teacher.component';

describe('AssignEnglishTeacherComponent', () => {
  let component: AssignEnglishTeacherComponent;
  let fixture: ComponentFixture<AssignEnglishTeacherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignEnglishTeacherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignEnglishTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
