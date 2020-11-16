import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';


const years = require('ye-ars');


@Component({
  selector: 'app-new-period',
  templateUrl: './new-period.component.html',
  styleUrls: ['./new-period.component.scss']
})
export class NewPeriodComponent implements OnInit {

  title = 'Nuevo Período';
  formPeriod : FormGroup;

  yearsInput = years({count:10});

  minDate: Date;
  myFilter = (d: Date): boolean => {
    const day = d.getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  }
  constructor(
    public dialogRef: MatDialogRef<NewPeriodComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
            this.title = this.data.operation === 'edit' ? 'Editar Período' : this.title;
     }

  ngOnInit() {
    if(this.data.operation == 'edit'){

      this.formPeriod = new FormGroup({
        'year': new FormControl((this.data.period.year ? this.data.period.year : null),[Validators.required]),
        'periodName': new FormControl((this.data.period.periodName ? this.data.period.periodName : null),[Validators.required]),
        'initDate': new FormControl((this.data.period.initDate ? new Date(this.data.period.initDate) : null),[Validators.required]),
        'endDate': new FormControl((this.data.period.endDate ? new Date(this.data.period.endDate) : null),[Validators.required]),
        'insPerInitDate': new FormControl((this.data.period.insPerInitDate ? new Date(this.data.period.insPerInitDate) : null),[Validators.required]),
        'insPerEndDate': new FormControl((this.data.period.insPerEndDate ? new Date(this.data.period.insPerEndDate) : null),[Validators.required]),
        'arecPerInitDate': new FormControl((this.data.period.arecPerInitDate ? new Date(this.data.period.arecPerInitDate) : null),[Validators.required]),
        'arecPerEndDate': new FormControl((this.data.period.arecPerEndDate ? new Date(this.data.period.arecPerEndDate) : null),[Validators.required]),
        'arecInitShed': new FormControl((this.data.period.arecInitShed ? parseInt( this.data.period.arecInitShed+'') : null),[Validators.required, Validators.min(1), Validators.max(24)]),
        'arecEndShed': new FormControl((this.data.period.arecEndShed ? parseInt(this.data.period.arecEndShed+'') : null),[Validators.required, Validators.min(1), Validators.max(24)]),
        'certificateDeliveryDate': new FormControl((this.data.period.certificateDeliveryDate ? this.data.period.certificateDeliveryDate : null),[Validators.required]),
        'englishPerInitDate': new FormControl((this.data.period.englishPerInitDate ? new Date(this.data.period.englishPerInitDate) : null),[Validators.required]),
        'englishPerEndDate': new FormControl((this.data.period.englishPerEndDate ? new Date(this.data.period.englishPerEndDate) : null),[Validators.required]),
        'englishSecPerInitDate': new FormControl((this.data.period.englishSecPerInitDate ? new Date(this.data.period.englishSecPerInitDate) : null),[Validators.required]),
        'englishSecPerEndDate': new FormControl((this.data.period.englishSecPerEndDate ? new Date(this.data.period.englishSecPerEndDate) : null),[Validators.required]),
      });
      this.minDate = new Date(this.formPeriod.get('year').value);

    }else {
      this.formPeriod = new FormGroup({
        'year': new FormControl(null,[Validators.required]),
        'periodName': new FormControl(null,[Validators.required]),
        'initDate': new FormControl(null,[Validators.required]),
        'endDate': new FormControl(null,[Validators.required]),
        'insPerInitDate': new FormControl(null,[Validators.required]),
        'insPerEndDate': new FormControl(null,[Validators.required]),
        'arecPerInitDate': new FormControl(null,[Validators.required]),
        'arecPerEndDate': new FormControl(null,[Validators.required]),
        'arecInitShed': new FormControl(null,[Validators.required]),
        'arecEndShed': new FormControl(null,[Validators.required]),
        'certificateDeliveryDate': new FormControl(null,[Validators.required]),
        'englishPerInitDate': new FormControl(null,[Validators.required]),
        'englishPerEndDate': new FormControl(null,[Validators.required]),
        'englishSecPerInitDate': new FormControl(null,[Validators.required]),
        'englishSecPerEndDate': new FormControl(null,[Validators.required]),
      });
    }
  }

  onClose(){
    this.dialogRef.close({action:'close'});
  }

  onFormSubmit(period ){
    if(this.data.operation === 'edit'){
      period._id=this.data.period._id;
      this.dialogRef.close({action:'edit',period});
    }else{
      period.periodName = period.periodName;
      // this.data.initialPeriod === 'true' ? period.periodName : this.data.initialPeriod;
      this.dialogRef.close({action:'submit',period});
    }
  }

  createYear(year){


    this.minDate = year ? new Date(year) : new Date();
  }

}
