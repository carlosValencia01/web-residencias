import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTitleComponent } from './new-title.component';

describe('NewTitleComponent', () => {
  let component: NewTitleComponent;
  let fixture: ComponentFixture<NewTitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewTitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
