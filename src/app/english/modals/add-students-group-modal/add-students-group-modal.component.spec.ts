import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStudentsGroupModalComponent } from './add-students-group-modal.component';

describe('AddStudentsGroupModalComponent', () => {
  let component: AddStudentsGroupModalComponent;
  let fixture: ComponentFixture<AddStudentsGroupModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddStudentsGroupModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddStudentsGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
