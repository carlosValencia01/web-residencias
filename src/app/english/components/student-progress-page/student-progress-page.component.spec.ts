import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentProgressPageComponent } from './student-progress-page.component';

describe('StudentProgressPageComponent', () => {
  let component: StudentProgressPageComponent;
  let fixture: ComponentFixture<StudentProgressPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentProgressPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentProgressPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
