import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentEnglishPageComponent } from './student-english-page.component';

describe('StudentEnglishPageComponent', () => {
  let component: StudentEnglishPageComponent;
  let fixture: ComponentFixture<StudentEnglishPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentEnglishPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentEnglishPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
