import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraduationEventsPageComponent } from './graduation-events-page.component';

describe('GraduationEventsPageComponent', () => {
  let component: GraduationEventsPageComponent;
  let fixture: ComponentFixture<GraduationEventsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraduationEventsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraduationEventsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
