import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { NotificationsServices } from 'src/services/app/notifications.service';
import { CookiesService } from 'src/services/app/cookie.service';
import { FirebaseService } from 'src/services/graduation/firebase.service';

@Component({
  selector: 'app-my-graduation',
  templateUrl: './my-graduation.component.html',
  styleUrls: ['./my-graduation.component.scss']
})
export class MyGraduationComponent implements OnInit {

  studentSub : Subscription;
  eventSub : Subscription;
  user;
  event;
  eventId;
  student;
  isGraduate : boolean = false;
  constructor(
    private notificationsServices: NotificationsServices,
    private cookiesService: CookiesService,
    private router: Router,
    private routeActive: ActivatedRoute,
    private firebaseSrv: FirebaseService,
  ) {
    if (!this.cookiesService.isAllowed(this.routeActive.snapshot.url[0].path)) {
      this.router.navigate(['/']);      
    }
    this.user = this.cookiesService.getData().user;   
   }

  ngOnInit() {
    
    const sr = this.firebaseSrv.getEventId(this.user.email).subscribe(
        ev=>{
          // console.log(ev[0]);
          
          sr.unsubscribe();
          if(ev[0]){
            this.isGraduate = true;
            this.eventSub = this.firebaseSrv.getEvent(ev[0].event).subscribe(
              (event)=>{                         
                this.event = event.payload.data();
                this.eventId = event.payload.id;                          
                this.studentSub = this.firebaseSrv.getGraduateByControlNumber(this.user.email+'',this.eventId).subscribe(
                  (student)=>{
                    this.student = student[0];
                    if(this.student.data.observations !== ''){
                      this.student.data.observations = this.student.data.observations.split(';');
                    }                      
                                
                  }
                );
              }
            );
            
          }else{      
            this.isGraduate = false;
            const sub1  = this.firebaseSrv.getActivedEvent().subscribe(
              (event )=>{                 
                sub1.unsubscribe();
                this.event = event[0].payload.doc.data();      
                this.eventId = event[0].payload.doc.id;      
                console.log(this.event);
                               
              }
            );
          }
        },
        err=>{
          const sub1  = this.firebaseSrv.getActivedEvent().subscribe(
            (event)=>{                 
              sub1.unsubscribe();
              console.log(err);
              this.event = event[0].payload.doc.data();      
                this.eventId = event[0].payload.doc.id;                    
            }
          );
        }
      );    

  }

}
