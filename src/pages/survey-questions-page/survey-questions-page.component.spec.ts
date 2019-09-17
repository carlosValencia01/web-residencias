import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyQuestionsPageComponent } from './survey-questions-page.component';

describe('SurveyQuestionsPageComponent', () => {
  let component: SurveyQuestionsPageComponent;
  let fixture: ComponentFixture<SurveyQuestionsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyQuestionsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyQuestionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
