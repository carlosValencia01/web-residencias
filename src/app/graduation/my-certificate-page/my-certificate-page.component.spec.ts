import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MyCertificatePageComponent } from './my-certificate-page.component';

describe('MyCertificatePageComponent', () => {
  let component: MyCertificatePageComponent;
  let fixture: ComponentFixture<MyCertificatePageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MyCertificatePageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MyCertificatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
