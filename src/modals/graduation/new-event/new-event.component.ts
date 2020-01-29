import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as years from 'ye-ars';
import { GraduationEventsPageComponent } from 'src/pages/graduation/graduation-events-page/graduation-events-page.component';
@Component({
  selector: 'app-new-event',
  templateUrl: './new-event.component.html',
  styleUrls: ['./new-event.component.scss']
})
export class NewEventComponent implements OnInit {

  title = 'Nuevo evento de graduación';
  form : FormGroup;

  yearsInput = years({count:10});
    
  minDate: Date;
  
  constructor(
    public dialogRef: MatDialogRef<GraduationEventsPageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,    
    ) {
            this.title = this.data.operation === 'edit' ? 'Editar Periodo' : this.title;
     }

  ngOnInit() {
    
      this.form = new FormGroup({   
        'year': new FormControl(null,[Validators.required]),
        'periodName': new FormControl(null,[Validators.required]),     
        'date': new FormControl(null,[Validators.required]),        
        'totalTickets': new FormControl(null,[Validators.required, Validators.min(0)]),
        'studentTickets': new FormControl(null,[Validators.required, Validators.min(0)])
      });  
  }

  onClose(){
    this.dialogRef.close({action:'close'});
  }

  onFormSubmit(event ){      
    this.dialogRef.close({action:'submit',event});    
  }

  createYear(year){    
    this.minDate = year ? new Date(year) : new Date();
  }

}
