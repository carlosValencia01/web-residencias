import { EnglishModule } from './english.module';

describe('EnglishModule', () => {
  let englishModule: EnglishModule;

  beforeEach(() => {
    englishModule = new EnglishModule();
  });

  it('should create an instance', () => {
    expect(englishModule).toBeTruthy();
  });
});
