import { CredentialsModule } from './credentials.module';

describe('CredentialsModule', () => {
  let credentialsModule: CredentialsModule;

  beforeEach(() => {
    credentialsModule = new CredentialsModule();
  });

  it('should create an instance', () => {
    expect(credentialsModule).toBeTruthy();
  });
});
