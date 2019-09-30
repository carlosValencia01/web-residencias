import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyFindPageComponent } from './survey-find-page.component';

describe('SurveyFindPageComponent', () => {
  let component: SurveyFindPageComponent;
  let fixture: ComponentFixture<SurveyFindPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyFindPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyFindPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
