import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileInscriptionPageComponent } from './profile-inscription-page.component';

describe('ProfileInscriptionPageComponent', () => {
  let component: ProfileInscriptionPageComponent;
  let fixture: ComponentFixture<ProfileInscriptionPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileInscriptionPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileInscriptionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
