import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EnglishCourseProvider } from '../../providers/english-course.prov';
import { NotificationsServices } from 'src/app/services/app/notifications.service';
import { eNotificationType } from 'src/app/enumerators/app/notificationType.enum';

@Component({
  selector: 'app-boss-message',
  templateUrl: './boss-message.component.html',
  styleUrls: ['./boss-message.component.scss']
})
export class BossMessageComponent implements OnInit {

  form: FormGroup;
  bossMessage;
  edit: boolean = false; // para saber si se va a editar el mensaje o crear
  @ViewChild('messageIn') messageIn: ElementRef<HTMLTextAreaElement>;
  loaded = false;
  constructor(
    private englishCourseProv: EnglishCourseProvider,
    private notificationServ: NotificationsServices
  ) { 

  }

  ngOnInit() {
    this.englishCourseProv.getEnBossMessage().toPromise().then((data)=>{  
      this.bossMessage = data.message;          
      this.edit = true;
      this.form = new FormGroup({
        message: new FormControl(this.bossMessage.message ? this.bossMessage.message :'', Validators.required)
      }); 
      this.loaded = true;
      setTimeout(() => {
        this.messageIn.nativeElement.focus();
      }, 600);
    }).catch(err=>{
      this.form = new FormGroup({
        message: new FormControl('', Validators.required)
      });
      this.edit = false; 
      this.loaded = true;
    });

  }

  saveMessage(message){
    if(this.edit){
      // editar el mensaje
      this.englishCourseProv.updateEnBossMessage(this.bossMessage._id,message).subscribe(updated=>{this.notificationServ.showNotification(eNotificationType.SUCCESS,'CLE','Mensaje actualizado con exito.')});
    }else{
      // crear el mensaje
      this.englishCourseProv.createEnBossMessage(message).subscribe(data=>{
        this.bossMessage = data.message;      
        this.edit = true;
        this.notificationServ.showNotification(eNotificationType.SUCCESS,'CLE','Mensaje guardado con exito.')
      })
    }
    
  }

}
