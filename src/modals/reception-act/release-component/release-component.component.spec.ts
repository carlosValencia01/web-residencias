import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseComponentComponent } from './release-component.component';

describe('ReleaseComponentComponent', () => {
  let component: ReleaseComponentComponent;
  let fixture: ComponentFixture<ReleaseComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleaseComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
