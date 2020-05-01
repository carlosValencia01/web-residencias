import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WizardInscriptionPageComponent } from './wizard-inscription-page.component';

describe('WizardInscriptionPageComponent', () => {
  let component: WizardInscriptionPageComponent;
  let fixture: ComponentFixture<WizardInscriptionPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WizardInscriptionPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardInscriptionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
