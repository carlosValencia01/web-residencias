import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeEmailsPageComponent } from './welcome-emails-page.component';

describe('WelcomeEmailsPageComponent', () => {
  let component: WelcomeEmailsPageComponent;
  let fixture: ComponentFixture<WelcomeEmailsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WelcomeEmailsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeEmailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
