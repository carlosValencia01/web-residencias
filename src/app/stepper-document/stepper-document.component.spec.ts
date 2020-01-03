import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StepperDocumentComponent } from './stepper-document.component';

describe('StepperDocumentComponent', () => {
  let component: StepperDocumentComponent;
  let fixture: ComponentFixture<StepperDocumentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StepperDocumentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepperDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
