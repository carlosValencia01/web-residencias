import { SocialServiceModule } from './social-service.module';

describe('SocialServiceModule', () => {
  let socialServiceModule: SocialServiceModule;

  beforeEach(() => {
    socialServiceModule = new SocialServiceModule();
  });

  it('should create an instance', () => {
    expect(socialServiceModule).toBeTruthy();
  });
});
