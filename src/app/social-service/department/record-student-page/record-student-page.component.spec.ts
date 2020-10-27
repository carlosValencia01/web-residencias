import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordStudentPageComponent } from './record-student-page.component';

describe('RecordStudentPageComponent', () => {
  let component: RecordStudentPageComponent;
  let fixture: ComponentFixture<RecordStudentPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordStudentPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordStudentPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
