import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SecretaryInscriptionPageComponent } from './secretary-inscription-page.component';

describe('SecretaryInscriptionPageComponent', () => {
  let component: SecretaryInscriptionPageComponent;
  let fixture: ComponentFixture<SecretaryInscriptionPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SecretaryInscriptionPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecretaryInscriptionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
