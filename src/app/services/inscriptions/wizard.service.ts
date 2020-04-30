import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class WizardService {

  private stepOneSource = new BehaviorSubject(false);
  currentStepOne = this.stepOneSource.asObservable();

  private stepTwoSource = new BehaviorSubject(false);
  currentStepTwo = this.stepTwoSource.asObservable();

  private stepThreeSource = new BehaviorSubject(false);
  currentStepThree = this.stepThreeSource.asObservable();

  private stepFourSource = new BehaviorSubject(false);
  currentStepFour = this.stepFourSource.asObservable();

  constructor() { }

  changeStepOneStatus(status: boolean) {
    this.stepOneSource.next(status);
  }

  changeStepTwoStatus(status: boolean) {
    this.stepTwoSource.next(status);
  }

  changeStepThreeStatus(status: boolean) {
    this.stepThreeSource.next(status);
  }

  changeStepFourStatus(status: boolean) {
    this.stepFourSource.next(status);
  }
}
