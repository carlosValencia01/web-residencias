import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadFileTitledComponent } from './upload-file-titled.component';

describe('UploadFileTitledComponent', () => {
  let component: UploadFileTitledComponent;
  let fixture: ComponentFixture<UploadFileTitledComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadFileTitledComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadFileTitledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
