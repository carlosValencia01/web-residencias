import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EnglishCourseProvider } from 'src/app/english/providers/english-course.prov';
import Swal from 'sweetalert2';
import { ICourse } from '../../entities/course.model';

@Component({
  selector: 'app-review-information-modal',
  templateUrl: './review-information-modal.component.html',
  styleUrls: ['./review-information-modal.component.scss']
})
export class ReviewInformationModalComponent implements OnInit {
  public course;
  public level;
  public teacher;
  public period;
  public startHour;
  public endHour;

  public courseForm: FormGroup;
  public courses: ICourse[];
  public courseLevels: number[];
  private selectedCourse: ICourse;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<ReviewInformationModalComponent>,
    private englishCourseProv: EnglishCourseProvider,
  ) {
    this.getCourses();
  }

  ngOnInit() {
    this.course = this.data.student.courseType._id;
    this.level = this.data.student.level;
    this.teacher = this.data.student.lastLevelInfo.teacher;
    this.period = this.data.student.lastLevelInfo.period;
    this.startHour = this.getHour(this.data.student.lastLevelInfo.startHour);
    this.endHour = this.getHour(this.data.student.lastLevelInfo.endHour);
  }

  public selectCourse(): void {
    const courseId = this.courseForm.get('course').value;
    this.selectedCourse = this._getCourseById(courseId);
    if (this.selectedCourse) {
      this.courseLevels = Array.from(Array(this.selectedCourse.totalSemesters + 1).keys()).slice(1);
    }
  }

  public canSelectLevel(): boolean {
    return this.courseForm.get('course').valid && !!this.selectedCourse;
  }

  private _init(): void {
    this.courseForm = new FormGroup({
      course: new FormControl(this.course, Validators.required),
      level: new FormControl(this.level, Validators.required),
      startHour: new FormControl(this.startHour, Validators.required),
      endHour: new FormControl(this.endHour, Validators.required),
      teacher: new FormControl(this.teacher, Validators.required),
      period: new FormControl(this.period, Validators.required),
    });
    this.selectCourse();
  }

  private _getCourseById(courseId: string): ICourse {
    return this.courses.find(({ _id }) => _id === courseId) as ICourse;
  }

  private _getFormData(): IProfileInfo {
    const startHour = (this.courseForm.get('startHour').value || '').split(':', 2);
    const endHour = (this.courseForm.get('endHour').value || '').split(':', 2);
    return {
      course: this.selectedCourse,
      level: this.courseForm.get('level').value,
      lastLevelInfo: {
        startHour: (Number(startHour[0]) * 60) + Number(startHour[1]),
        endHour: (Number(endHour[0]) * 60) + Number(endHour[1]),
        teacher: this.courseForm.get('teacher').value,
        period: this.courseForm.get('period').value,
      },
    };
  }

  onClose() {
    this.dialogRef.close({ action: 'close' });
  }

  public saveData(): void {
    Swal.fire({
      title: 'Verificar Información',
      text: `¿Está seguro de actualizar y verificar la información del curso previo del alumno?`,
      type: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'green',
      cancelButtonColor: 'red',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        const data = this._getFormData();
        this.dialogRef.close({ action: 'update', data: data, id: this.data.student._id });
      }
    });
  }

  public accept(): void {
    Swal.fire({
      title: 'Verificar Información',
      text: `¿Está seguro de verificar la información del curso previo del alumno?`,
      type: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'green',
      cancelButtonColor: 'red',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.dialogRef.close({ action: 'accept', id: this.data.student._id });
      }
    });
  }

  public reject(): void {
    Swal.fire({
      title: 'Rechazar Información',
      text: `¿Está seguro de rechazar la información del curso previo del alumno?`,
      type: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'green',
      confirmButtonText: 'Si',
      cancelButtonText: 'No',
      focusCancel: true
    }).then((result) => {
      if (result.value) {
        this.dialogRef.close({ action: 'reject', id: this.data.student._id });
      }
    });
  }


  async getCourses() {
    this.courses = await this._getAllActiveEnglishCourses();
    this._init();
  }

  private _getAllActiveEnglishCourses(): Promise<ICourse[]> {
    return new Promise((resolve) => {
      this.englishCourseProv
        .getAllEnglishCourseActive()
        .subscribe(
          (res: { englishCourses: ICourse[] }) => resolve(res.englishCourses),
          (_) => resolve([])
        );
    });
  }

  getHour(minutes): String { //Convierte minutos a tiempo en formato 24-h
    let h = Math.floor(minutes / 60); //Consigue las horas
    let m = minutes % 60; //Consigue los minutos
    let hh = h < 10 ? '0' + h : h; //Asigna un 0 al inicio de la hora si es menor a 10
    let mm = m < 10 ? '0' + m : m; //Asigna un 0 al inicio de los minutos si es menor a 10
    return hh + ':' + mm; //Retorna los minutos en tiempo Ej: "24:00"
  }

}

interface IProfileInfo {
  course: ICourse;
  level: number;
  lastLevelInfo: {
    startHour: number;
    endHour: number;
    teacher: string;
    period: string;
  }
}
