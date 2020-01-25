import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RangePageComponent } from './range-page.component';

describe('RangePageComponent', () => {
  let component: RangePageComponent;
  let fixture: ComponentFixture<RangePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RangePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RangePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
