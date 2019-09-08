import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyGraduatesPageComponent } from './survey-graduates-page.component';

describe('SurveyGraduatesPageComponent', () => {
  let component: SurveyGraduatesPageComponent;
  let fixture: ComponentFixture<SurveyGraduatesPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyGraduatesPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyGraduatesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
