import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/services/firebase.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-survey-page',
  templateUrl: './survey-page.component.html',
  styleUrls: ['./survey-page.component.scss']
})
export class SurveyPageComponent implements OnInit {
  public nc = null;
  public idDocAlumn = null;

  //Variable donde se guardan las preguntas
  public questions = [];

  //Contador de pregunta
  public contQuestion = 0;

  //Variable para almacenar Respuestas
  public answersQuestions = [];

  constructor(    
    private firestoreService: FirebaseService,
    private router: Router,
    ) 
  { }

  ngOnInit() {
    this.idDocAlumn=this.router.url.split('/')[2];
    this.nc=this.router.url.split('/')[3];
    this.getQuestionsSurvey();
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
    //this.answersQuestions["idQuestion"]=this.contQuestion+1;
    this.answersQuestions.push({idQuestion:this.contQuestion+1,question:this.questions[this.contQuestion].descripcion,answer:answer})
    if(this.contQuestion < this.questions.length-1){
      this.contQuestion++;
    }else{
      console.log(this.answersQuestions);
      Swal.fire({
        title: 'Encuesta Finalizada',
        text: "Click en aceptar para finalizar",
        type: 'success',
        allowOutsideClick: false,
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      }).then((result) => {
        if (result.value) {
          this.firestoreService.saveAnswersQuestions(this.idDocAlumn,this.answersQuestions).then(
            created=>{
              this.router.navigate(['/student']);  
            }
          ); 
        }
      }) 
    }
  }
}