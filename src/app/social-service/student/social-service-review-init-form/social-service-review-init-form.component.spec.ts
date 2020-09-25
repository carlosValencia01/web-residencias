import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialServiceReviewInitFormComponent } from './social-service-review-init-form.component';

describe('SocialServiceReviewInitFormComponent', () => {
  let component: SocialServiceReviewInitFormComponent;
  let fixture: ComponentFixture<SocialServiceReviewInitFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocialServiceReviewInitFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialServiceReviewInitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
