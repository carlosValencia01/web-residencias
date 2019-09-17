import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { isNullOrUndefined } from 'util';
import { ok } from 'assert';
import { GraduationProvider } from '../../providers/graduation.prov';
import { NotificationsServices } from '../../services/notifications.service';




@Component({
  selector: 'app-survey-page',
  templateUrl: './survey-page.component.html',
  styleUrls: ['./survey-page.component.scss']
})
export class SurveyPageComponent implements OnInit {
  public nc = null;
  public idDocAlumn = null;
  public activeEvent = null;
  public graduateItem = null;

  //Variable donde se guardan las preguntas
  public questions = [];

  //Contador de pregunta
  public contQuestion = 0;

  // Verificar si son preguntas con carita o radio/abiertas
  public survey = true;
  public radioPrimerEmpleo;
  public empleoFamiliar;
  public recomendations;

  // Variable para almacenar Respuestas
  public answersQuestions = [];

    //variable para validar ID y NC
  itsOK : boolean = false;
  constructor(    
    private firestoreService: FirebaseService,
    private router: Router,
    private graduationProv : GraduationProvider,
    private notificationsServices: NotificationsServices
    ) 
  {
    this.idDocAlumn=this.router.url.split('/')[2];
    this.nc=this.router.url.split('/')[3];
    let subs =  this.firestoreService.getActivedEvent().subscribe(
      res => {
        
        
        subs.unsubscribe();
        this.activeEvent = res[0].payload.doc.id;
        let sub = firestoreService.getGraduate(this.idDocAlumn,this.activeEvent).subscribe(
          graduate=>{
            sub.unsubscribe();
            if(!isNullOrUndefined(graduate)){   
              this.graduateItem = graduate.payload.data();    
              console.log(this.graduateItem);
                        
              if(!this.graduateItem.survey){
                if(this.nc == graduate.payload.get('nc')){
                  this.itsOK=true;
                  this.getQuestionsSurvey(); //todo OK
                }else{
                  this.itsOK=false; //no coincide el NC con el ID
                }
              }else{
                this.itsOK = false; //ya respondio la encuesta
              }                         
            }else{
              this.itsOK=false; //no existe el alumno
            }
          }
        )
      }
    );

   }

  ngOnInit() {
    
  }
  
  getQuestionsSurvey(){
    this.firestoreService.getQuestionsSurvey().subscribe(async (questionsSnapshot) => {      
      this.questions =  questionsSnapshot.map( (question) =>{
        return {
          id : question.payload.doc.id,
          descripcion : question.payload.doc.get("descripcion")
        }});
      });
  }

  nextQuestion(answer){
    if(this.contQuestion <= 5){
      let score = answer == 'Muy Buena' ? 3 : answer == 'Buena' ? 2 : answer == 'Regular' ? 1 : 0;
      this.answersQuestions.push({idQuestion:this.contQuestion+1,question:this.questions[this.contQuestion].descripcion,answer:answer,score:score})
    }
    if(this.contQuestion < this.questions.length-1){
      this.contQuestion++;
      if(this.contQuestion > 5){
        this.survey=false;
      }
    }
  }

  nextQuestionPE(){
    this.answersQuestions.push({idQuestion:this.contQuestion+1,question:this.questions[this.contQuestion].descripcion,answer:this.radioPrimerEmpleo,empleoFamiliar:this.empleoFamiliar});
    if(this.contQuestion < this.questions.length-1){
      this.contQuestion++;
    }
  }

  nextQuestionRecomendations(){
    this.answersQuestions.push({idQuestion:this.contQuestion+1,question:this.questions[this.contQuestion].descripcion,answer:this.recomendations});
    if(this.contQuestion < this.questions.length-1){
      
      this.contQuestion++;
    }else{
      this.firestoreService.saveAnswersQuestions(this.idDocAlumn,this.answersQuestions,this.activeEvent).then();
      this.sendQR(this.graduateItem);
      Swal.fire({
        title: 'Encuesta Finalizada',
        text: "Click en aceptar para finalizar",
        type: 'info',
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {     
        if (result.value) {
          window.location.assign("/") //salir de la encuesta
        }
      })
    }
  }

  sendQR(item) {
    this.graduationProv.sendQR(item.correo,this.idDocAlumn,item.nombre).subscribe(
      res=>{
        this.notificationsServices.showNotification(1, 'Tu Invitación Fué Enviada','');
      },
      err =>{
        this.notificationsServices.showNotification(2, 'No se pudo enviar la invitación:','');
      }
    ) 
  }
}
