import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleasedOptionsPageComponent } from './released-options-page.component';

describe('ReleasedOptionsPageComponent', () => {
  let component: ReleasedOptionsPageComponent;
  let fixture: ComponentFixture<ReleasedOptionsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleasedOptionsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleasedOptionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
