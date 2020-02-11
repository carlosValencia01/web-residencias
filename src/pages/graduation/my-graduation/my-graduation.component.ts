import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import * as crypto from "crypto-js";
import domtoimage from 'dom-to-image';

import { NotificationsServices } from 'src/services/app/notifications.service';
import { CookiesService } from 'src/services/app/cookie.service';
import { FirebaseService } from 'src/services/graduation/firebase.service';
import { eQR } from 'src/enumerators/graduation/e-qr.enum';

@Component({
  selector: 'app-my-graduation',
  templateUrl: './my-graduation.component.html',
  styleUrls: ['./my-graduation.component.scss']
})
export class MyGraduationComponent implements OnInit {

  studentSub: Subscription;
  eventSub: Subscription;
  user;
  event;
  eventId;
  student;
  isGraduate: boolean = false;
  graduationDate;
  limitGraduationDate;
  qrData;
  guests = [];
  titleDegree: string;
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
    this.init();
  }

  ngOnInit() {
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const sr = this.firebaseSrv.getEventId(this.user.email).subscribe(
      ev => {
        sr.unsubscribe();
        if (ev[0]) {
          this.isGraduate = true;
          this.eventSub = this.firebaseSrv.getEvent(ev[0].event).subscribe(
            (event) => {
              this.event = event.payload.data();
              this.eventId = event.payload.id;
              this.graduationDate = new Date(this.event.date.seconds * 1000).toLocaleDateString("es-MX", dateOptions);
              this.limitGraduationDate = new Date(this.event.limitDate.seconds * 1000).toLocaleDateString("es-MX", dateOptions);
              this.studentSub = this.firebaseSrv.getGraduateByControlNumber(this.user.email + '', this.eventId).subscribe(
                (student) => {
                  this.student = student[0];
                  if (this.student.data.observations !== '') {
                    this.student.data.observations = this.student.data.observations.split(';');
                  }

                }
              );
            }
          );

        } else {
          this.isGraduate = false;
          const sub1 = this.firebaseSrv.getActivedEvent().subscribe(
            (event) => {
              this.event = event[0].payload.doc.data();
              this.eventId = event[0].payload.doc.id;
              this.graduationDate = new Date(this.event.date.seconds * 1000).toLocaleDateString("es-MX", dateOptions);
              this.limitGraduationDate = new Date(this.event.limitDate.seconds * 1000).toLocaleDateString("es-MX", dateOptions);
              sub1.unsubscribe();
            }
          );
        }
      },
      err => {
        const sub1 = this.firebaseSrv.getActivedEvent().subscribe(
          (event) => {
            this.event = event[0].payload.doc.data();
            this.eventId = event[0].payload.doc.id;
            this.graduationDate = new Date(this.event.date.seconds * 1000).toLocaleDateString("es-MX", dateOptions);
            this.limitGraduationDate = new Date(this.event.limitDate.seconds * 1000).toLocaleDateString("es-MX", dateOptions);
            sub1.unsubscribe();
            console.log(err);
          });
      });
    }

  init(){
      const sr = this.firebaseSrv.getEventId(this.user.email).subscribe(
        ev => {
          // console.log(ev[0]);

          sr.unsubscribe();
          if (ev[0]) {
            this.isGraduate = true;
            this.eventSub = this.firebaseSrv.getEvent(ev[0].event).subscribe(
              (event) => {
                this.event = event.payload.data();
                this.eventId = event.payload.id;
                this.studentSub = this.firebaseSrv.getGraduateByControlNumber(this.user.email + '', this.eventId).subscribe(
                  (student) => {
                    this.student = student[0];
                    this.qrData = crypto.AES.encrypt(this.student.id, eQR.KEY).toString();
                    if (this.student.data.observations !== '') {
                      this.student.data.observations = this.student.data.observations.split(';');
                    }
                    this.guests = [];
                    this.titleDegree = this.student.data.degree && this.student.data.carrera != 'LA' && this.student.data.carrera != 'ARQ' && this.student.data.carrera != 'MCA' && this.student.data.carrera != 'DCA' ? 'ING.' : this.student.data.degree && this.student.data.carrera == 'LA' ? 'LIC.' : this.student.data.degree && this.student.data.carrera == 'ARQ' ? 'ARQ.' : this.student.data.degree && this.student.data.carrera == 'MCA' ? 'MCA.' : this.student.data.degree && this.student.data.carrera == 'DCA' ? 'DCA.' : '';
                    const invitados = this.student.data.invitados;
                    invitados.forEach((invitado) => {

                      const ticketFor = Object.keys(invitado)[0];
                      if (invitado[ticketFor] == 'verificado') {
                        this.guests.push(
                          {
                            data: crypto.AES.encrypt(this.student.id + '&' + ticketFor, eQR.KEY).toString(),
                            ticketFor
                          });
                      }
                    });


                  }
                );
              }
            );

          } else {
            this.isGraduate = false;
            const sub1 = this.firebaseSrv.getActivedEvent().subscribe(
              (event) => {
                sub1.unsubscribe();
                this.event = event[0].payload.doc.data();
                this.eventId = event[0].payload.doc.id;
                console.log(this.event);

              }
            );
          }
        },
        err => {
          const sub1 = this.firebaseSrv.getActivedEvent().subscribe(
            (event) => {
              sub1.unsubscribe();
              console.log(err);
              this.event = event[0].payload.doc.data();
              this.eventId = event[0].payload.doc.id;
            }
          );
        }
      );
    }

  async saveQR(id){
      await domtoimage.toJpeg(document.getElementById(id), { quality: 1 })
        .then(async (dataUrl) => {
          var link = document.createElement('a');
          link.download = '_qr-' + id + '.jpeg';
          link.href = dataUrl;
          link.click();
        });
    }

}
