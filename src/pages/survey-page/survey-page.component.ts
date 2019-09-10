import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-survey-page',
  templateUrl: './survey-page.component.html',
  styleUrls: ['./survey-page.component.scss']
})
export class SurveyPageComponent implements OnInit {

  questions=[];
  alumnoNc='';
  alumnoID='';
  answers=[];
  contesto : boolean;
  constructor(
    private ceremoniaService : FirebaseService,
    private router : Router
  ) { 
    let url = this.router.url.split('/');
    this.alumnoID = url[2];
    this.alumnoNc = url[3];
    this.ceremoniaService.getQuestions().subscribe(
      res=>{ this.questions=res;
      }
    )
   }

  ngOnInit() {
  }

  //guarda temporalmente la respuesta de la pregunta
  saveAnswer(questionID, answer){
    this.answers.push({pregID:questionID,respuesta:answer});
    this.questions.shift();
    console.log(this.answers);
    this.contesto=true;
  }

  }
