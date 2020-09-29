import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateIneComponent } from './certificate-ine.component';

describe('CertificateIneComponent', () => {
  let component: CertificateIneComponent;
  let fixture: ComponentFixture<CertificateIneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CertificateIneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CertificateIneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
