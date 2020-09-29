import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewPhotosPaydocModalComponent } from './review-photos-paydoc-modal.component';

describe('ReviewPhotosPaydocModalComponent', () => {
  let component: ReviewPhotosPaydocModalComponent;
  let fixture: ComponentFixture<ReviewPhotosPaydocModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewPhotosPaydocModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewPhotosPaydocModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
