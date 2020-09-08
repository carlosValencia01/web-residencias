import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  socket;
  
  constructor() { 
    this.socket = io(environment.apiURL.split('/escolares')[0],{path: '/escolares/credenciales/socket'});
    
  }

  listen(eventName: string):Observable<any>{
    return new Observable((sub)=>{
        this.socket.on(eventName,(data)=>{
          sub.next(data);
        });
    });
  }
}
