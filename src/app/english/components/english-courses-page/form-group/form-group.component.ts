import { Component, OnInit } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

//Importar Servicios
import { LoadingService } from 'src/app/services/app/loading.service';

//Importar Proveedores
import { EnglishCourseProvider } from 'src/app/english/providers/english-course.prov';

@Component({
  selector: 'app-form-group',
  templateUrl: './form-group.component.html',
  styleUrls: ['./form-group.component.scss']
})
export class FormGroupComponent implements OnInit {

  groupFormGroup: FormGroup;

  englishCourses: any; //Cursos de ingles activos

  levels: Array<Number>; //Niveles de acuerdo a los semestres del curso seleccionado

  startHours="";
  endDates="";

  schedule=[
    {
      day: 1,
      desc:"Lunes",
      startHour: "",
      endDate: "",
      active: false,
    },
    {
      day: 2,
      desc:"Martes",
      startHour: "",
      endDate: "",
      active: false,
    },
    {
      day: 3,
      desc:"Miércoles",
      startHour: "",
      endDate: "",
      active: false,
    },
    {
      day: 4,
      desc:"Jueves",
      startHour: "",
      endDate: "",
      active: false,
    },
    {
      day: 5,
      desc:"Viernes",
      startHour: "",
      endDate: "",
      active: false,
    },
    {
      day: 6,
      desc:"Sábados",
      startHour: "",
      endDate: "",
      active: false,
    }
  ]

  constructor(
    private loadingService: LoadingService,
    private englishCourseProv: EnglishCourseProvider,
    public dialogRef: MatDialogRef<FormGroupComponent>,
    private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.groupFormGroup = this._formBuilder.group({
      nameCtrl: ['', [Validators.required]],
      courseCtrl: ['', [Validators.required]],
      levelCtrl: ['', [Validators.required]],
      scheduleCtrl: ['', [Validators.required]],
    });

    this.groupFormGroup.get('courseCtrl').valueChanges.subscribe(course => this.createOptionsLevel(course.totalSemesters));

    this.createEnglishCourses();
  }

  createEnglishCourses(){ //Obtener los cursos activos para mostrar
    this.loadingService.setLoading(true);
    this.englishCourseProv.getAllEnglishCourseActive().subscribe(res => { //Obtener los cursos de la API

      this.englishCourses = res.englishCourses; //Guardar los cursos activos

    },error => {

    }, () => this.loadingService.setLoading(false));
  }

  createOptionsLevel(value){
    console.log(value);
    if(value){
      this.levels = [];
      for (let index = 1; index <= value; index++) {
        this.levels.push(index);
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
