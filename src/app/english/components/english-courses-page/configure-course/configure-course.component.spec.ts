import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureCourseComponent } from './configure-course.component';

describe('ConfigureCourseComponent', () => {
  let component: ConfigureCourseComponent;
  let fixture: ComponentFixture<ConfigureCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureCourseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
