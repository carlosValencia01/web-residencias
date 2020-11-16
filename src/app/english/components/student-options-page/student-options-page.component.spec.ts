import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentOptionsPageComponent } from './student-options-page.component';

describe('StudentOptionsPageComponent', () => {
  let component: StudentOptionsPageComponent;
  let fixture: ComponentFixture<StudentOptionsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentOptionsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentOptionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
