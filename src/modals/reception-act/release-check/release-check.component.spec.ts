import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseCheckComponent } from './release-check.component';

describe('ReleaseCheckComponent', () => {
  let component: ReleaseCheckComponent;
  let fixture: ComponentFixture<ReleaseCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleaseCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
