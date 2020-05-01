import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SteepComponentComponent } from './steep-component.component';

describe('SteepComponentComponent', () => {
  let component: SteepComponentComponent;
  let fixture: ComponentFixture<SteepComponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SteepComponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SteepComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
