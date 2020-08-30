import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewInformationPageComponent } from './review-information-page.component';

describe('ReviewInformationPageComponent', () => {
  let component: ReviewInformationPageComponent;
  let fixture: ComponentFixture<ReviewInformationPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewInformationPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewInformationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
