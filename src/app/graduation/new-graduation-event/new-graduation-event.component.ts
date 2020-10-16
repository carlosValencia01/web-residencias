import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as years from 'ye-ars';
import { GraduationEventsPageComponent } from 'src/app/graduation/graduation-events-page/graduation-events-page.component';
@Component({
  selector: 'app-new-graduation-event',
  templateUrl: './new-graduation-event.component.html',
  styleUrls: ['./new-graduation-event.component.scss']
})
export class NewGraduationEventComponent implements OnInit {

  title = 'Nuevo evento de graduación';
  form : FormGroup;

  yearsInput = years({count:10});
    
  minDate: Date;
  eventId;
  
  constructor(
    public dialogRef: MatDialogRef<GraduationEventsPageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,    
    ) {
            this.title = this.data.operation === 'edit' ? 'Editar Evento' : this.title;
            this.eventId = this.data.operation == 'edit' ? this.data.event.id : '';
     }

  ngOnInit() {
    
    if(this.data.operation !== 'edit'){

      this.form = new FormGroup({   
        'year': new FormControl(null,[Validators.required]),
        'periodName': new FormControl(null,[Validators.required]),     
        'date': new FormControl(null,[Validators.required]),        
        'limitDate': new FormControl(null,[Validators.required]),
        'certificateInitDate': new FormControl(null,[Validators.required]) ,
        'certificateEndDate': new FormControl(null,[Validators.required]) ,
        'hour': new FormControl(null,[Validators.required]),
        'hourGallery': new FormControl(null,[Validators.required]),
        'directorMessage': new FormControl(null,[Validators.required]),
        'observationsMessage': new FormControl(null,[Validators.required]),
        'directorName': new FormControl(null,[Validators.required]),
        'totalTickets': new FormControl(null,[Validators.required, Validators.min(0)]),
        'studentTickets': new FormControl(null,[Validators.required, Validators.min(0)]),
        'videoUrl': new FormControl(null,null),
        'imageUrl': new FormControl(null,null),
      });  
    }else{
      this.form = new FormGroup({                
        'date': new FormControl(this.data.event.date.toDate(),[Validators.required]),        
        'limitDate': new FormControl(this.data.event.limitDate.toDate(),[Validators.required]),
        'certificateInitDate': new FormControl(this.data.event.certificateInitDate ? this.data.event.certificateInitDate.toDate() : this.minDate,[Validators.required]) ,
        'certificateEndDate': new FormControl(this.data.event.certificateEndDate ? this.data.event.certificateEndDate.toDate() : this.minDate,[Validators.required]) ,
        'hour': new FormControl(this.data.event.hour,[Validators.required]),
        'hourGallery': new FormControl(this.data.event.hourGallery,[Validators.required]),
        'directorMessage': new FormControl(this.data.event.directorMessage,[Validators.required]),
        'observationsMessage': new FormControl(this.data.event.observationsMessage,[Validators.required]),
        'directorName': new FormControl(this.data.event.directorName,[Validators.required]),
        'totalTickets': new FormControl(this.data.event.totalTickets,[Validators.required, Validators.min(0)]),
        'studentTickets': new FormControl(this.data.event.studentTickets,[Validators.required, Validators.min(0)]),
        'videoUrl': new FormControl(this.data.event.videoUrl,null),
        'imageUrl': new FormControl(this.data.event.imageUrl,null),
        'folderIdDrive': new FormControl(this.data.event.folderIdDrive,null)
      });  
    }
  }

  onClose(){
    this.dialogRef.close({action:'close'});
  }

  onFormSubmit(event ){      
    if(this.data.operation == 'edit'){
      event.id = this.eventId;
      this.dialogRef.close({action:'edit',event});    
    }else{
      this.dialogRef.close({action:'create',event});    
    }
  }

  createYear(year){    
    this.minDate = year ? new Date(year) : new Date();
  }

}
