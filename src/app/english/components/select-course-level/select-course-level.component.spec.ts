import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectCourseLevelComponent } from './select-course-level.component';

describe('SelectCourseLevelComponent', () => {
  let component: SelectCourseLevelComponent;
  let fixture: ComponentFixture<SelectCourseLevelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectCourseLevelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectCourseLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
