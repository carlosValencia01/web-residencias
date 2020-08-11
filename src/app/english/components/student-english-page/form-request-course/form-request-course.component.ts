import { Component, OnInit, Inject } from '@angular/core';

import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MatTableDataSource} from '@angular/material/table';

import { LoadingService } from 'src/app/services/app/loading.service';
import { GroupProvider } from 'src/app/english/providers/group.prov';

export interface DialogData {
  courseSelected: any;
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
  shedule: Array<any>;

  dataSource: MatTableDataSource<any>;

  constructor(
    private loadingService: LoadingService,
    private groupProv: GroupProvider,
    public dialogRef: MatDialogRef<FormRequestCourseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, 
    private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.groupFormGroup = this._formBuilder.group({
      groupCtrl: ['', Validators.required]
    });
    this.phoneFormGroup = this._formBuilder.group({
      phoneCtrl: ['', [ Validators.pattern('^[0-9]{10}$'), Validators.required]]
    });
    this.getGroups();
    console.log(this.groupFormGroup.value);
    console.log(this.data);
  }

  getGroups(){
    let data = {
      courseId: this.data.courseSelected._id,
      level: this.data.level + 1,
    }
    console.log(data);
    this.loadingService.setLoading(true);
    this.groupProv.getAllGroupOpenedByCourseAndLevel(data).subscribe(res => {

      console.log(res);
      this.prepareShedule(res.groups);

    },error => {

    }, () => this.loadingService.setLoading(false));
  }

  prepareShedule(groups){
    this.shedule = [];
    if (groups.length>0) {
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
        this.shedule.push(data);
      });
    };
    this.createDataSource();
  }

  getHour(minutes):String{
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    let hh = h < 10 ? '0' + h : h;
    let mm = m < 10 ? '0' + m : m;
    return hh+':'+mm;
  }

  createDataSource(){
    this.dataSource = new MatTableDataSource(this.shedule);
    console.log(this.shedule);
    console.log(this.dataSource);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
