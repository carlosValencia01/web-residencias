import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnglishCoursesPageComponent } from './english-courses-page.component';

describe('EnglishCoursesPageComponent', () => {
  let component: EnglishCoursesPageComponent;
  let fixture: ComponentFixture<EnglishCoursesPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnglishCoursesPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnglishCoursesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
