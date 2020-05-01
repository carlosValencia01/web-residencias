import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewCredentialsComponent } from './review-credentials.component';

describe('ReviewCredentialsComponent', () => {
  let component: ReviewCredentialsComponent;
  let fixture: ComponentFixture<ReviewCredentialsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewCredentialsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
