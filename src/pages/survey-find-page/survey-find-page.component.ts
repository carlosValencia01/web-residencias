import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { FormGroup,FormBuilder, Validators, FormControl } from '@angular/forms';
import { NotificationsServices } from '../../services/notifications.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-survey-find-page',
  templateUrl: './survey-find-page.component.html',
  styleUrls: ['./survey-find-page.component.scss']
})
export class SurveyFindPageComponent implements OnInit {

  @ViewChild('emailgraduateinput') emailGraduateInput:  ElementRef;

  formEmailGraduate: FormGroup;
  errorEmail: boolean = false;
  errorForm: boolean = false;
  correo:string='';
  public eventActived = null;

  //Buscar alumno
  public ncInput = '';
  public findProfile;
  public docId;

  constructor(
    private firestoreService: FirebaseService,
    private formBuilder: FormBuilder,
    private notificationsServices: NotificationsServices,
    private router: Router,
    ) {
      
    }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.formEmailGraduate = this.formBuilder.group({
      'emailGraduateInput': ['', [Validators.required, Validators.email]],
    });
    this.ncInput = '';
    this.findProfile = false;
    this.docId = null;
  }

  formValidation(): boolean {
    let invalid = false;
    this.errorForm = false;
    this.errorEmail = false;
    if (this.formEmailGraduate.invalid) {
      this.errorForm = true;
      this.errorEmail = true;
      invalid = true;
    }
    return invalid;
  }

  searchAlumno(){
      if (this.ncInput !== '') {
        this.firestoreService.getActivedEvent().subscribe(
          res => {
            this.eventActived = res[0].payload.doc.id;
            this.firestoreService.getGraduates(this.eventActived).subscribe((alumnosSnapshot) => {
              alumnosSnapshot.forEach((alumnosData: any) => {
                if(this.ncInput === alumnosData.payload.doc.data().nc){
                  this.docId = alumnosData.payload.doc.id;
                  this.findProfile = true;
                }
              })
              if(this.findProfile){
                window.location.assign('/surveyRegister/'+this.docId+'/'+this.ncInput);          
              } else {
                this.firestoreService.getProfiles().subscribe((profilesSnapshot) => {
                  profilesSnapshot.forEach((profileData: any) => {
                    if(this.ncInput === profileData.payload.doc.data().ncAlumno){
                      this.docId = profileData.payload.doc.id;
                      this.findProfile = true;
                    }
                  })
                  if(this.findProfile){
                    window.location.assign('/surveyRegister/'+this.docId+'/'+this.ncInput);          
                  } else{
                    window.location.assign('/surveyRegister/'+0+'/'+this.ncInput);  
                  }
                });
              }
            });
        });
      } else {
        this.notificationsServices.showNotification(1, 'Atención','No se ha ingresado ningún número de contról.');
      }   
  }
}
