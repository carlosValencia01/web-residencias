import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialServiceInitFormComponent } from './social-service-init-form.component';

describe('SocialServiceInitFormComponent', () => {
  let component: SocialServiceInitFormComponent;
  let fixture: ComponentFixture<SocialServiceInitFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocialServiceInitFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialServiceInitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
