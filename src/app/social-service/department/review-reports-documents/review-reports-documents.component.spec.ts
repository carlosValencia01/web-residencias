import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewReportsDocumentsComponent } from './review-reports-documents.component';

describe('ReviewReportsDocumentsComponent', () => {
  let component: ReviewReportsDocumentsComponent;
  let fixture: ComponentFixture<ReviewReportsDocumentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewReportsDocumentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewReportsDocumentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
