import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { CareerProvider } from 'src/providers/shared/career.prov';
import { UserProvider } from 'src/providers/app/user.prov';
@Component({
  selector: 'app-secretary-assignment',
  templateUrl: './secretary-assignment.component.html',
  styleUrls: ['./secretary-assignment.component.scss']
})
export class SecretaryAssignmentComponent implements OnInit {

  title = '    ASIGNACIÓN DE CARRERAS ';
  careers = [];
  secretaries = [];
  constructor(
    public dialogRef: MatDialogRef<SecretaryAssignmentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private careerProv: CareerProvider,    
    private userProv: UserProvider,    
  ) {
      
    this.getCareers();
    this.getSecretaries();
    
   }

  ngOnInit() {
    
  }

  onClose(){
    this.dialogRef.close({action:'close'});
  }
  
  getCareers(){
    this.careerProv.getAllCareers().subscribe(
      res=>{
        if(res.careers){
          let  careers = res.careers;
          careers.forEach( career => {
            this.careers.push({name:career.shortName,_id:career._id});
          });                 
        }
      });
  }
  getSecretaries(){
    this.userProv.getSecretaries().subscribe(
      users=>{
        this.secretaries = users.users;
      }
    );
  }



  setCareer(ev){
    let ss = ev.split('-');
    this.userProv.update(ss[0],{careerId:ss[1]}).subscribe(
      se=>{console.log(se,'serer');
      }
    );
  }
}
