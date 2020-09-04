import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlStudentsMainPageComponent } from './control-students-main-page.component';

describe('ControlStudentsMainPageComponent', () => {
  let component: ControlStudentsMainPageComponent;
  let fixture: ComponentFixture<ControlStudentsMainPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlStudentsMainPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlStudentsMainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
