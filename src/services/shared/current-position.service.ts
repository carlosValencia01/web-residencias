import {EventEmitter, Injectable, Output} from '@angular/core';
import {CookiesService} from 'src/services/app/cookie.service';
import {PositionProvider} from 'src/providers/shared/position.prov';

import {IPosition} from 'src/entities/shared/position.model';

@Injectable()
export class CurrentPositionService {
  private currentPosition;

  constructor(private cookiesService: CookiesService, private positionProvider: PositionProvider) {
  }

  @Output() changedPosition: EventEmitter<IPosition> = new EventEmitter();

  getCurrentPosition() {
    return new Promise(async resolve => {
      if (!this.currentPosition) {
        this.currentPosition = await this.getPosition();
      }
      resolve(this.currentPosition);
    });
  }

  setCurrentPosition(position: IPosition) {
    this.currentPosition = position;
    this.changedPosition.emit(this.currentPosition);
  }

  getPosition() {
    return new Promise(resolve => {      
      const positionId = this.cookiesService.getData().user.position;
      this.positionProvider.getPositionById(positionId).subscribe(position => {
        resolve(position);
      }, err => {
        resolve(null);
      });
    });
  }
}
