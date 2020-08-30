import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomeStudentsPageComponent } from './welcome-students-page.component';

describe('WelcomeStudentsPageComponent', () => {
  let component: WelcomeStudentsPageComponent;
  let fixture: ComponentFixture<WelcomeStudentsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WelcomeStudentsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeStudentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
