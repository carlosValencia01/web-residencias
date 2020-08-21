import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveGroupModalComponent } from './active-group-modal.component';

describe('ActiveGroupModalComponent', () => {
  let component: ActiveGroupModalComponent;
  let fixture: ComponentFixture<ActiveGroupModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActiveGroupModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
