import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LockSessionComponent } from './lock-session.component';

describe('LockSessionComponent', () => {
  let component: LockSessionComponent;
  let fixture: ComponentFixture<LockSessionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LockSessionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LockSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
