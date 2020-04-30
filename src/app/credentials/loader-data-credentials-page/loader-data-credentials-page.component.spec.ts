import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderDataCredentialsPageComponent } from './loader-data-credentials-page.component';

describe('LoaderDataCredentialsPageComponent', () => {
  let component: LoaderDataCredentialsPageComponent;
  let fixture: ComponentFixture<LoaderDataCredentialsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoaderDataCredentialsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoaderDataCredentialsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
