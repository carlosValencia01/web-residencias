import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyRegisterPageComponent } from './survey-register-page.component';

describe('SurveyRegisterPageComponent', () => {
  let component: SurveyRegisterPageComponent;
  let fixture: ComponentFixture<SurveyRegisterPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyRegisterPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyRegisterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
