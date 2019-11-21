import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeModalComponent } from './range-modal.component';

describe('RangeModalComponent', () => {
  let component: RangeModalComponent;
  let fixture: ComponentFixture<RangeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RangeModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RangeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
