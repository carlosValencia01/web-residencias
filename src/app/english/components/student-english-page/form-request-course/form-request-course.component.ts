import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { GroupProvider } from 'src/app/english/providers/group.prov';
import { LoadingService } from 'src/app/services/app/loading.service';
import { ICourse } from '../../../entities/course.model';
import { IGroup } from '../../../entities/group.model';

export interface DialogData {
  courseSelected: ICourse;
  level: number;
  groupId: string;
  currentPhone: string;
}

@Component({
  selector: 'app-form-request-course',
  templateUrl: './form-request-course.component.html',
  styleUrls: ['./form-request-course.component.scss']
})
export class FormRequestCourseComponent implements OnInit {

  groupFormGroup: FormGroup;
  phoneFormGroup: FormGroup;
  schedule: Array<any>;

  dataSource: MatTableDataSource<any>;

  constructor(
    private loadingService: LoadingService,
    private groupProv: GroupProvider,
    public dialogRef: MatDialogRef<FormRequestCourseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private _formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.groupFormGroup = this._formBuilder.group({
      groupCtrl: ['', Validators.required]
    });
    this.phoneFormGroup = this._formBuilder.group({
      phoneCtrl: ['', [Validators.pattern('^[0-9]{10}$'), Validators.required]]
    });
    this.getGroups();
  }

  getGroups() {
    let data = {
      courseId: this.data.courseSelected._id,
      level: this.data.level + 1,
    }
    this.loadingService.setLoading(true);
    this.groupProv.getAllGroupOpenedByCourseAndLevel(data).subscribe(res => {

      this.prepareSchedule(res.groups);

    }, error => {

    }, () => this.loadingService.setLoading(false));
  }

  prepareSchedule(groups: IGroup[]) {
    this.schedule = [];
    if (groups.length > 0) {
      groups.forEach(element => {
        var data = {
          _id: element._id,
          monday: "",
          tuesday: "",
          wednesday: "",
          thursday: "",
          Fryday: "",
          saturday: ""
        };
        element.schedule.forEach(day => {
          switch (day.day) {
            case 1:
              data.monday = this.getHour(day.startHour) + " - " + this.getHour(day.endDate);
              break;
            case 2:
              data.tuesday = this.getHour(day.startHour) + " - " + this.getHour(day.endDate);
              break;
            case 3:
              data.wednesday = this.getHour(day.startHour) + " - " + this.getHour(day.endDate);
              break;
            case 4:
              data.thursday = this.getHour(day.startHour) + " - " + this.getHour(day.endDate);
              break;
            case 5:
              data.Fryday = this.getHour(day.startHour) + " - " + this.getHour(day.endDate);
              break;
            case 6:
              data.saturday = this.getHour(day.startHour) + " - " + this.getHour(day.endDate);
              break;
          }
        });
        this.schedule.push(data);
      });
    };
    this.createDataSource();
  }

  getHour(minutes): String {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    let hh = h < 10 ? '0' + h : h;
    let mm = m < 10 ? '0' + m : m;
    return hh + ':' + mm;
  }

  createDataSource() {
    this.dataSource = new MatTableDataSource(this.schedule);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
