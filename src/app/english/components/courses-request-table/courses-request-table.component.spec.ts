import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursesRequestTableComponent } from './courses-request-table.component';

describe('CoursesRequestTableComponent', () => {
  let component: CoursesRequestTableComponent;
  let fixture: ComponentFixture<CoursesRequestTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoursesRequestTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursesRequestTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
