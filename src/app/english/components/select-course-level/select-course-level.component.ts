import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { eNotificationType } from '../../../enumerators/app/notificationType.enum';
import { NotificationsServices } from '../../../services/app/notifications.service';
import { ICourse } from '../../entities/course.model';

@Component({
  selector: 'app-select-course-level',
  templateUrl: './select-course-level.component.html',
  styleUrls: ['./select-course-level.component.scss']
})
export class SelectCourseLevelComponent implements OnInit {
  public courseForm: FormGroup;
  public courses: ICourse[];
  public courseLevels: number[];
  private selectedCourse: ICourse;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { courses: ICourse[] },
    private dialogRef: MatDialogRef<SelectCourseLevelComponent>,
    private notification: NotificationsServices,
  ) {
    this.courses = this.data.courses;

    this._init();
  }

  ngOnInit() {
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

  public saveLevelCourse(): void {
    if (!this.courseForm.valid) {
      return this.notification.showNotification(eNotificationType.INFORMATION, 'Selección de curso', 'Llene todos los campos obligatorios');
    }
    const data = this._getFormData();
    this.dialogRef.close(data);
  }

  private _init(): void {
    this.courseForm = new FormGroup({
      course: new FormControl(null, Validators.required),
      level: new FormControl(null, Validators.required),
      startHour: new FormControl(null, Validators.required),
      endHour: new FormControl(null, Validators.required),
      teacher: new FormControl(null, Validators.required),
      period: new FormControl(null, Validators.required),
    });
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
