import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntegrantsComponentComponent } from './integrants-component.component';

describe('IntegrantsComponentComponent', () => {
  let component: IntegrantsComponentComponent;
  let fixture: ComponentFixture<IntegrantsComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IntegrantsComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrantsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
