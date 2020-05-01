import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadEmployeesCsvComponent } from './upload-employees-csv.component';

describe('UploadEmployeesCsvComponent', () => {
  let component: UploadEmployeesCsvComponent;
  let fixture: ComponentFixture<UploadEmployeesCsvComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadEmployeesCsvComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadEmployeesCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
