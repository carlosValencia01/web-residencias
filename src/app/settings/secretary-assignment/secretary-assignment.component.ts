import { Component, OnInit, Inject, ViewChild,ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {FormControl} from '@angular/forms';
import {MatAutocompleteSelectedEvent, MatAutocomplete} from '@angular/material/autocomplete';
import {MatChipInputEvent} from '@angular/material/chips';


import { CareerProvider } from 'src/app/providers/shared/career.prov';
import { UserProvider } from 'src/app/providers/app/user.prov';
@Component({
  selector: 'app-secretary-assignment',
  templateUrl: './secretary-assignment.component.html',
  styleUrls: ['./secretary-assignment.component.scss']
})
export class SecretaryAssignmentComponent implements OnInit {

  title = '    ASIGNACIÓN DE CARRERAS ';
  careers = [];
  careersAvailable = [];
  filteredCareers = [];
  secretaries = [];

  // Career selection chips
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  careerCtrl = new FormControl();

  @ViewChild('careerInput') careerInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  constructor(
    public dialogRef: MatDialogRef<SecretaryAssignmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private careerProv: CareerProvider,    
    private userProv: UserProvider,    
  ) {
            
    this.getSecretaries();    
    
   }

  ngOnInit() {
    this.userProv.refreshNeeded$.subscribe(
      ()=>{
        this.getSecretaries();
      }
    );
  }

  onClose(){
    this.dialogRef.close({action:'close'});
  }
  
  getCareers(){
    this.careerProv.getAllCareers().subscribe(
      res=>{
        if(res.careers){
          this.careers = res.careers;
          this.careersAvailable = this.careers;
          for(let i=0; i< this.secretaries.length;i++){
            if(this.secretaries[i].careers){
              for(let j=0; j<this.secretaries[i].careers.length;j++){
               this.careersAvailable = this.careersAvailable.filter( car=> car._id !== this.secretaries[i].careers[j].careerId._id);                
              }
            }
          }       
          // for(let i=0; i< this.secretaries.length; i++){
          //   let notin = [];
          //   if(this.secretaries[i].careers){
          //     if( this.secretaries[i].careers.length !== this.careers.length){
          //       for(let j=0; j<this.secretaries[i].careers.length;j++){            
          //           notin = notin.length === 0 ? this.careers.filter( 
          //             car=> car._id !== this.secretaries[i].careers[j].careerId._id) :
          //             notin.filter(car=> car._id !== this.secretaries[i].careers[j].careerId._id);     
          //       }              
          //       this.secretaries[i].noCareers = notin.length === 0 ? this.careers : notin;  
          //       this.secretaries[i].filteredCareers =    notin.length === 0 ? this.careers : notin;        
          //     }else{
          //       this.secretaries[i].noCareers = [];  
          //       this.secretaries[i].filteredCareers = [];           
          //     }
          //   }else{
          //     this.secretaries[i].careers = [];
          //     this.secretaries[i].noCareers = this.careers;  
          //     this.secretaries[i].filteredCareers =  this.careers;
          //   }
                                 
          // }                                          
        }
      });
  }
  getSecretaries(){
    this.userProv.getSecretaries().subscribe(
      users=>{
        this.secretaries = users.users;

        this.getCareers();
      }
    );
  }



  updateCareers(careerId,action,secreId){
    this.userProv.updateCareers(secreId,{careerId:careerId},action).subscribe(
      se=>{
      },
      err=>{
        console.log(err,'errror');
        
      }
    );    
  }

  add(event: MatChipInputEvent): void {
    // Add fruit only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event

    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;
      // Reset the input value

      if (input) {
        input.value = '';
      }

      this.careerCtrl.setValue(null);
    }
  }

  remove(career, secre): void {
    // const index = this.careers.indexOf(career);
    this.updateCareers(career._id,'delete', secre._id);
    // if (index >= 0) {
    //   this.careers.splice(index, 1);
    // }
  }

  selected(event: MatAutocompleteSelectedEvent,secre): void {
    // this.careers.push(event.option.viewValue);
    // this.careerInput.nativeElement.value = '';
    const career = event.option.value;    
  
    this.updateCareers(career._id,'insert', secre._id);
    this.careerCtrl.setValue(null);
  }
  filter(value,i){     
    if(value){
      // this.secretaries[i].filteredCareers = this.secretaries[i].noCareers.filter( career=> career.fullName.toLowerCase().indexOf(value.toString().trim().toLowerCase()) !== -1);
      this.filteredCareers = this.careersAvailable.filter( career=> career.fullName.toLowerCase().indexOf(value.toString().trim().toLowerCase()) !== -1);
    }
  }
  focus(i){
    // this.secretaries[i].filteredCareers = this.secretaries[i].noCareers;
    this.filteredCareers = this.careersAvailable;
  }
  slectedCareer(career,sec){
    this.updateCareers(career._id,'insert', sec._id);
    this.careerCtrl.setValue(null);
  }

 
}
