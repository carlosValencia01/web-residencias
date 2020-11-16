import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadAvgsModalComponent } from './upload-avgs-modal.component';

describe('UploadAvgsModalComponent', () => {
  let component: UploadAvgsModalComponent;
  let fixture: ComponentFixture<UploadAvgsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadAvgsModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadAvgsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
