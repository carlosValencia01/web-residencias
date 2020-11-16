import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignClassroomComponent } from './assign-classroom.component';

describe('AssignClassroomComponent', () => {
  let component: AssignClassroomComponent;
  let fixture: ComponentFixture<AssignClassroomComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignClassroomComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignClassroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
