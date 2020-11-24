import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewLastReportPageComponent } from './review-last-report-page.component';

describe('ReviewLastReportPageComponent', () => {
  let component: ReviewLastReportPageComponent;
  let fixture: ComponentFixture<ReviewLastReportPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewLastReportPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewLastReportPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
