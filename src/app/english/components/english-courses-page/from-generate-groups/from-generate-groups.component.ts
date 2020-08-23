import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ValidatorFn, ValidationErrors } from '@angular/forms';
import * as Papa from 'papaparse';
import Swal from 'sweetalert2';

// Importar Servicios
import { LoadingService } from 'src/app/services/app/loading.service';

// Importar Proveedores
import { EnglishCourseProvider } from 'src/app/english/providers/english-course.prov';

// Importar Enumeradores
import { EDaysSchedule } from 'src/app/english/enumerators/days-schedule.enum';

// Importar modelos
import { ICourse } from '../../../entities/course.model';

@Component({
  selector: 'app-from-generate-groups',
  templateUrl: './from-generate-groups.component.html',
  styleUrls: ['./from-generate-groups.component.scss']
})
export class FromGenerateGroupsComponent implements OnInit {

  groupsFormGroup: FormGroup;

  englishCourses: ICourse[]; //Cursos de ingles activos

  minCapacityStudents = 1;
  maxCapacityStudents = 50;

  dayschedule = EDaysSchedule; //Enumerador de los dias de la semana
  showTableCSV = false;
  showTableHours = false;

  weekdays = [1, 2, 3, 4, 5, 6]; //Dias de la semana

  hourStart = "07:00"; //Tiempo de inicio
  hourEnd = "21:00"; //Tiempo de finalización
  segment = 30; //Cantidad en minutos de los segmentos
  dataHours = []; //Horas que se van a mostrar
  dataSchedule = []; //Arreglo de los dias seleccionados

  constructor(
    private loadingService: LoadingService,
    private englishCourseProv: EnglishCourseProvider,
    public dialogRef: MatDialogRef<FromGenerateGroupsComponent>,
    private _formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.groupsFormGroup = this._formBuilder.group(
      {
        courseCtrl: ['', [Validators.required]],
        minCapacityCtrl: ['', [Validators.required, Validators.min(this.minCapacityStudents), Validators.max(this.maxCapacityStudents)]],
        maxCapacityCtrl: ['', [Validators.required, Validators.min(this.minCapacityStudents), Validators.max(this.maxCapacityStudents)]],
        scheduleCtrl: ['', [Validators.required]],
      },
      {
        validator: this.MinCapacityLessThanMaxCapacity,
      }
    );

    this.groupsFormGroup.get('courseCtrl').valueChanges.subscribe(course => {
      this.groupsFormGroup.get('scheduleCtrl').setValue('');
    });

    this.groupsFormGroup.get('scheduleCtrl').valueChanges.subscribe(option => {
      this.dataSchedule = [];
      switch (option) {
        case '1':
          this.showTableHours = false;
          break;
        case '2':
          this.showTableCSV = false;
          break;
      }
    });

    this.createEnglishCourses();

  }

  createDataHours() { //Genera las Horas en segmentos

    this.dataHours = [];
    const start = this.getMinutes(this.hourStart); //Convierte la hora de inicio en minutos
    let end = this.getMinutes(this.hourEnd); //Convierte la hora de fin en minutos
    end -= (this.groupsFormGroup.get('courseCtrl').value.dailyHours * 60); //Se resta el tiempo que dura el curso al día
    for (let hour = start; hour <= end; hour = hour + this.segment) { //Recorrer de inicio a fin incrementando por segmentos
      this.dataHours.push(this.getHour(hour)); //Guardar el segmento de hora
    }
  }

  generateSchedule() { //Genera el arreglo en el que se guardaran los valores seleccionados
    this.dataSchedule = [];
    this.dataHours.forEach(a => { //Recorre cada una de las horas
      let week = []; //define arreglo de dias de la semana
      this.weekdays.forEach(b => { //Recorre cada dia de la semana
        week.push(""); //Agrega valor al dia
      });
      this.dataSchedule.push(week); //Agrega los dias de la semana a la hora
    });
  }

  selectHour(hour) { //Seleccionar hora de la Tabla
    //Si todos los campos estan vacios
    if (this.dataSchedule[hour][0] == "" && this.dataSchedule[hour][1] == "" && this.dataSchedule[hour][2] == "" &&
      this.dataSchedule[hour][3] == "" && this.dataSchedule[hour][4] == "" && this.dataSchedule[hour][5] == "") {
      for (let i = 0; i < 5; i++) {//De Lunes a Viernes
        this.dataSchedule[hour][i] = this.dataHours[hour]; //Asignar la hora seleccionada
      }
    } else {//Si no
      for (let i = 0; i < 6; i++) { //De lunes a Sabado
        this.dataSchedule[hour][i] = ""; //Dejar de seleccionar esos dias
      }
    }
  }

  MinCapacityLessThanMaxCapacity: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const minCapacity = control.get("minCapacityCtrl");
    const maxCapacity = control.get("maxCapacityCtrl");

    return minCapacity.value < maxCapacity.value ? null : { maxCapacityLess: true };
  }

  createEnglishCourses() { //Obtener los cursos activos para mostrar
    this.loadingService.setLoading(true);
    this.englishCourseProv.getAllEnglishCourseActive().subscribe(res => { //Obtener los cursos de la API

      this.englishCourses = res.englishCourses; //Guardar los cursos activos

    }, error => {

    }, () => this.loadingService.setLoading(false));
  }

  onUpload(event) {
    this.dataSchedule = [];
    this.showTableCSV = false;
    if (event.target.files && event.target.files[0]) {

      Papa.parse(event.target.files[0], {
        complete: async results => {
          if (results.data.length > 0) {
            const elements = results.data;
            const dailyHours = this.groupsFormGroup.get('courseCtrl').value.dailyHours;
            this.loadingService.setLoading(true);
            await this._asyncForEach(elements, async (element, index) => {
              if (element.length == 6) {
                if (index == 0) {
                  this.weekdays = [];
                  for (let j = 1; j <= element.length; j++) {
                    this.weekdays.push(j);
                  }
                } else {
                  var week = [];
                  for (let j = 0; j < element.length; j++) {
                    let hour = {
                      active: false,
                      startHour: null,
                      endDate: null,
                    }
                    if (element[j] != "") {
                      if (this.getMinutes(element[j]) >= this.getMinutes(this.hourStart) &&
                        this.getMinutes(element[j]) + (dailyHours * 60) <= this.getMinutes(this.hourEnd)) {

                        hour.active = true,
                          hour.startHour = this.getMinutes(element[j]);
                        hour.endDate = hour.startHour + dailyHours * 60;

                      }
                    }
                    week.push(hour);
                  }
                  this.dataSchedule.push(week);
                }
              } else {

              }
            });
            this.loadingService.setLoading(false);
            this.showTableCSV = true;
          }
        }
      });
    }
  }

  showCourse(course): boolean { //Mostrar el renglon de la hora
    //Si todos los campos estan inactivos
    if (!course[0].active && !course[1].active && !course[2].active &&
      !course[3].active && !course[4].active && !course[5].active) {
      return false; //Ocultar
    } else {
      return true; //Mostrar
    }
  }

  private async _asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }

  getMinutes(hour): number { //Convertir en minutos un tiempo Ej: "01:00" = 60
    var hh = parseFloat(hour.split(":", 2)[0]) //Convierte las horas en tipo number.
    var mm = parseFloat(hour.split(":", 2)[1]) //Convierte los minutos en tipo number.
    var time = mm + (hh * 60); //Convierte las horas y minutos y suma el total de minutos
    return time; //Retorna los minutos
  }

  getHour(minutes): String { //Convierte minutos a tiempo en formato 24-h
    let h = Math.floor(minutes / 60); //Consigue las horas
    let m = minutes % 60; //Consigue los minutos
    let hh = h < 10 ? '0' + h : h; //Asigna un 0 al inicio de la hora si es menor a 10
    let mm = m < 10 ? '0' + m : m; //Asigna un 0 al inicio de los minutos si es menor a 10
    return hh + ':' + mm; //Retorna los minutos en tiempo Ej: "24:00"
  }

  onChangeSegmentHour(value) {
    switch (value) {
      case '0':
        this.segment = 60;
        this.createDataHours();
        this.generateSchedule();
        this.showTableHours = true;
        break;
      case '1':
        this.segment = 30;
        this.createDataHours();
        this.generateSchedule();
        this.showTableHours = true;
        break;
    }
  }

  generateData(form) {

    var schedules = [];

    this.dataSchedule.forEach(schedule => {
      let scheduleForCourse = [];
      this.weekdays.forEach(day => {

        switch (form.scheduleCtrl) {

          case '1':

            if (schedule[day - 1] != "") {
              const data = {
                day: day,
                startHour: this.getMinutes(schedule[day - 1]),
                endDate: this.getMinutes(schedule[day - 1]) + (this.groupsFormGroup.get('courseCtrl').value.dailyHours * 60),
              };
              scheduleForCourse.push(data);
            }
            break;

          case '2':

            if (schedule[day - 1].active) {
              const data = {
                day: day,
                startHour: schedule[day - 1].startHour,
                endDate: schedule[day - 1].endDate,
              };
              if (this.showCourse(schedule)) {
                scheduleForCourse.push(data);
              }
            }
            break;
        }
      });
      if (scheduleForCourse.length > 0) {
        schedules.push(scheduleForCourse);
      }
    });

    if (schedules.length == 0) {
      Swal.fire({
        title: 'ATENCIÓN!',
        text: 'Es necesario agregar un horario.',
        showConfirmButton: false,
        timer: 2000,
        type: 'warning'
      })
      return;
    };

    const data = {
      courseName: form.courseCtrl.name,
      courseId: form.courseCtrl._id,
      levels: form.courseCtrl.totalSemesters,
      minCapacity: form.minCapacityCtrl,
      maxCapacity: form.maxCapacityCtrl,
      schedules: schedules,
    }
    this.dialogRef.close(data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
