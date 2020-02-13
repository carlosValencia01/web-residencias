import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/services/graduation/firebase.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-survey-questions-page',
  templateUrl: './survey-questions-page.component.html',
  styleUrls: ['./survey-questions-page.component.scss']
})
export class SurveyQuestionsPageComponent implements OnInit {

  public nc = null;
  public idDocAlumn = null;
  public eventActived = null;
  public profileItem = null;

  // Variable donde se guardan las preguntas
  public questions = [];

  // Contador de pregunta
  public contQuestion = 0;

  // Verificar si son preguntas con carita o radio/abiertas
  public survey = true;
  public radioPrimerEmpleo;
  public empleoFamiliar;
  public recomendations;

  // Variable para almacenar Respuestas
  public answersQuestions = [];

  // variable para validar ID y NC
  itsOK : boolean = false;
  constructor(    
    private firestoreService: FirebaseService,
    private router: Router,
    ) 
  {
    this.idDocAlumn=this.router.url.split('/')[2];
    this.nc=this.router.url.split('/')[3];
    let sub = firestoreService.getProfile(this.idDocAlumn).subscribe(
      profile=>{
        sub.unsubscribe();
        if(!isNullOrUndefined(profile)){   
          this.profileItem = profile.payload.data();  
          if(!this.profileItem.survey){
            if(this.nc == profile.payload.get('ncAlumno')){
              this.itsOK=true;
              this.getQuestionsSurvey(); //todo OK
            }else{
              this.itsOK=false; //no coincide el NC con el ID
            }
          }else{
            this.itsOK = false; //ya respondio la encuesta
            Swal.fire({
              title: 'Encuesta Finalizada',
              text: "Click en aceptar para finalizar",
              type: 'info',
              allowOutsideClick: false,
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Aceptar'
            }).then((result) => {     
              if (result.value) {
                window.location.assign("/my-graduation") //salir de la encuesta
              }
            }) 
          }                         
        }else{
          this.itsOK=false; //no existe el alumno
        }
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
    this.answersQuestions.push({idQuestion:this.contQuestion+1,question:this.questions[this.contQuestion].descripcion,answer:this.radioPrimerEmpleo,empleoFamiliar:this.empleoFamiliar ? this.empleoFamiliar : ''});
    if(this.contQuestion < this.questions.length-1){
      this.contQuestion++;
    }
  }

  nextQuestionRecomendations(){
    this.answersQuestions.push({idQuestion:this.contQuestion+1,question:this.questions[this.contQuestion].descripcion,answer:this.recomendations});
    if(this.contQuestion < this.questions.length-1){
      this.contQuestion++;
    }else{
      this.firestoreService.getActivedEvent().subscribe(
        res => {
          this.eventActived = res[0].payload.doc.id;
          this.firestoreService.getGraduate(this.idDocAlumn,this.eventActived).subscribe(
            res => {
              var data = res.payload.data();
              if(data !== undefined){ // Verificar que existan datos de alumno en evento principal
                this.firestoreService.updateStatusSurvey(this.idDocAlumn,this.eventActived).then();
                this.firestoreService.saveProfileAnswersQuestions(this.idDocAlumn,this.answersQuestions).then();
                Swal.fire({
                  title: 'Encuesta Finalizada',
                  text: "Clic en aceptar para finalizar",
                  type: 'info',
                  allowOutsideClick: false,
                  confirmButtonColor: '#3085d6',
                  confirmButtonText: 'Aceptar'
                }).then((result) => {     
                  if (result.value) {
                    window.location.assign("/my-graduation") //salir de la encuesta
                  }
                })
              } else {
                this.firestoreService.saveProfileAnswersQuestions(this.idDocAlumn,this.answersQuestions).then();
                Swal.fire({
                  title: 'Encuesta Finalizada',
                  text: "Clic en aceptar para finalizar",
                  type: 'info',
                  allowOutsideClick: false,
                  confirmButtonColor: '#3085d6',
                  confirmButtonText: 'Aceptar'
                }).then((result) => {     
                  if (result.value) {
                    window.location.assign("/surveyFind") //salir de la encuesta
                  }
                })
              }
            }
          );
        }
      );
    }
  }

}
