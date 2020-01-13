import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDeliveredComponent } from './upload-delivered.component';

describe('UploadDeliveredComponent', () => {
  let component: UploadDeliveredComponent;
  let fixture: ComponentFixture<UploadDeliveredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadDeliveredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadDeliveredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
