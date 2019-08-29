import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable()
export class SidebarService {
  private isOpen = true;
  private openedBeforeShowModal = true;

  @Output() changeStatus: EventEmitter<boolean> = new EventEmitter();

  opened() {
    this.isOpen = true;
    this.changeStatus.emit(this.isOpen);
  }

  closed() {
    this.isOpen = false;
    this.changeStatus.emit(this.isOpen);
  }

  openedModal() {
    this.openedBeforeShowModal = this.isOpen;
    this.isOpen = false;
    this.changeStatus.emit(this.isOpen);
  }

  closedModal() {
    if (!this.openedBeforeShowModal) {
      this.isOpen = false;
      return this.changeStatus.emit(this.isOpen);
    }
    this.isOpen = true;
    this.changeStatus.emit(this.isOpen);
  }
}
