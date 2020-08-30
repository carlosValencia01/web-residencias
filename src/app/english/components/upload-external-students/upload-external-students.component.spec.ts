import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadExternalStudentsComponent } from './upload-external-students.component';

describe('UploadExternalStudentsComponent', () => {
  let component: UploadExternalStudentsComponent;
  let fixture: ComponentFixture<UploadExternalStudentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadExternalStudentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadExternalStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
