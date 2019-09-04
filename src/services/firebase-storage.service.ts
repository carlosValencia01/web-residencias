import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';

@Injectable()
export class FirebaseStorageService {
  private basePath = 'requestFiles/';

  constructor(
    private storage: AngularFireStorage,
  ) { }

  onUploadFile(fileName: string, projectFile: any) {
    const path = this.basePath + fileName;
    return this.storage.upload(path, projectFile);
  }

  getFileURL(fileName: string) {
    const path = this.basePath + fileName;
    const ref = this.storage.ref(path);
    return ref.getDownloadURL();
  }
}
