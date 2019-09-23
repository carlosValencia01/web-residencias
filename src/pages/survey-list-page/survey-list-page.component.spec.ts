import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyListPageComponent } from './survey-list-page.component';

describe('SurveyListPageComponent', () => {
  let component: SurveyListPageComponent;
  let fixture: ComponentFixture<SurveyListPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyListPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
