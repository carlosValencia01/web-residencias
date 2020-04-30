import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UploadFilesService {

  private file1Source = new BehaviorSubject(false);
  currentalumnoFile1 = this.file1Source.asObservable();

  private file2Source = new BehaviorSubject(false);
  currentalumnoFile2 = this.file2Source.asObservable();

  private file3Source = new BehaviorSubject(false);
  currentalumnoFile3 = this.file3Source.asObservable();

  private file4Source = new BehaviorSubject(false);
  currentalumnoFile4 = this.file4Source.asObservable();

  private file5Source = new BehaviorSubject(false);
  currentalumnoFile5 = this.file5Source.asObservable();

  private file6Source = new BehaviorSubject(false);
  currentalumnoFile6 = this.file6Source.asObservable();

  private file7Source = new BehaviorSubject(false);
  currentalumnoFile7 = this.file7Source.asObservable();

  private file1StringSource = new BehaviorSubject('');
  currentFile1String = this.file1StringSource.asObservable();

  private file2StringSource = new BehaviorSubject('');
  currentFile2String = this.file2StringSource.asObservable();

  private file3StringSource = new BehaviorSubject('');
  currentFile3String = this.file3StringSource.asObservable();

  private file4StringSource = new BehaviorSubject('');
  currentFile4String = this.file4StringSource.asObservable();

  private file5StringSource = new BehaviorSubject('');
  currentFile5String = this.file5StringSource.asObservable();

  private file6StringSource = new BehaviorSubject('');
  currentFile6String = this.file6StringSource.asObservable();

  private file7StringSource = new BehaviorSubject('');
  currentFile7String = this.file7StringSource.asObservable();
  
  constructor() { }

  changeFile1(value: boolean) {
    this.file1Source.next(value);
  }

  changeFile2(value: boolean) {
    this.file2Source.next(value);
  }

  changeFile3(value: boolean) {
    this.file3Source.next(value);
  }

  changeFile4(value: boolean) {
    this.file4Source.next(value);
  }

  changeFile5(value: boolean) {
    this.file5Source.next(value);
  }

  changeFile6(value: boolean) {
    this.file6Source.next(value);
  }

  changeFile7(value: boolean) {
    this.file7Source.next(value);
  }

  changeStringFile1(value: string) {
    this.file1StringSource.next(value);
  }

  changeStringFile2(value: string) {
    this.file2StringSource.next(value);
  }

  changeStringFile3(value: string) {
    this.file3StringSource.next(value);
  }

  changeStringFile4(value: string) {
    this.file4StringSource.next(value);
  }

  changeStringFile5(value: string) {
    this.file5StringSource.next(value);
  }

  changeStringFile6(value: string) {
    this.file6StringSource.next(value);
  }

  changeStringFile7(value: string) {
    this.file7StringSource.next(value);
  }
}
