import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-documents-valid',
  templateUrl: './documents-valid.component.html',
  styleUrls: ['./documents-valid.component.scss']
})
export class DocumentsValidComponent implements OnInit {
  public documents: Array<{
    status: String,
    name: String,
    element: String
  }> = [
      { status: 'wait', name: 'Acta Nacimiento', element: 'ACTA_NACIMIENTO' },
      { status: 'reject', name: 'Curp', element: 'ACTA_NACIMIENTO' },
      { status: 'success', name: 'Cert. Bachillerato', element: 'ACTA_NACIMIENTO' },
      { status: 'wait', name: 'Cédula Técnica', element: 'ACTA_NACIMIENTO' }
    ]
  constructor() {
    // this.documents=[]
    // this.documents.push({status:'wait', name:'Acta Nacimiento',element:'ACTA_NACIMIENTO'});
    // this.documents.push({status:'reject', name:'Curp',element:'ACTA_NACIMIENTO'});
    // this.documents.push({status:'sucess', name:'Certificado Bachillerato',element:'ACTA_NACIMIENTO'});
    // this.documents.push({status:'wait', name:'Cédula Técnica',element:'ACTA_NACIMIENTO'});
  }

  ngOnInit() {

  }

}
