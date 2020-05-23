import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private status = false;

  constructor() { }

  @Output() isLoading: EventEmitter<boolean> = new EventEmitter();

  public setLoading(status: boolean) {
    this.status = status;
    this.isLoading.emit(this.status);
  }

}
