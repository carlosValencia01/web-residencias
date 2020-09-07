import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialServiceMainPageComponent } from './social-service-main-page.component';

describe('SocialServiceMainPageComponent', () => {
  let component: SocialServiceMainPageComponent;
  let fixture: ComponentFixture<SocialServiceMainPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocialServiceMainPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialServiceMainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
