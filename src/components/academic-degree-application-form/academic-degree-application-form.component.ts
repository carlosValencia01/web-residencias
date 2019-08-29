import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';

import Swal from 'sweetalert2';

import { OperationMode } from '../../enumerators/operation-mode.enum';
import { RequestStatus } from '../../enumerators/request-status.enum';
import { AcademicDegreeApplicationProvider } from '../../providers/academic-degree-application.prov';
import { CookiesService } from '../../services/cookie.service';
import { NotificationsServices } from '../../services/notifications.service';

@Component({
  selector: 'app-academic-degree-application-form',
  templateUrl: './academic-degree-application-form.component.html',
  styleUrls: ['./academic-degree-application-form.component.scss']
})
export class AcademicDegreeApplicationFormComponent implements OnInit {

  @ViewChild('projectFile') projectFileElement: ElementRef;
  public formRequest: FormGroup;
  private user: any;
  private formData: any;
  private operationMode: Number;
  private showObservations: boolean;
  private isUploadedFile: boolean;
  private projectFileName: string;
  private projectFile: any;
  private requestData: any;

  constructor(
    private academicDegreeProv: AcademicDegreeApplicationProvider,
    private cookiesService: CookiesService,
    private notificationsServices: NotificationsServices,
    private dateFormat: DatePipe
  ) {
    this.user = this.cookiesService.getData().user;
    this.isUploadedFile = false;
    this.operationMode = -1;
    this.showObservations = false;
  }

  ngOnInit() {
    this.academicDegreeProv.getRequestByControlNumber(this.user.email)
      .subscribe(request => {
        if (request.error) {
          this.operationMode = OperationMode.NEW;
          return;
        }
        if (request.status === RequestStatus.CAPTURED) {
          this.operationMode = OperationMode.CREATED;
          this.loadRequestData(request);
          if (request.observations) {
            this.showObservations = true;
          }
        } else if (request.status === RequestStatus.SENT) {
          this.operationMode = OperationMode.SENT;
          this.requestData = request;
        }
      });
    this.initializeForm();
  }

  initializeForm() {
    this.formRequest = new FormGroup({
      'name': new FormControl({
        value: this.user.name.firstName,
        disabled: this.operationMode === OperationMode.CREATED
      }, [Validators.required]),
      'lastname': new FormControl({
        value: this.user.name.lastName,
        disabled: this.operationMode === OperationMode.CREATED
      }, [Validators.required]),
      'telephone': new FormControl({
        value: null,
        disabled: this.operationMode === OperationMode.CREATED
      }, [Validators.required,
      Validators.pattern('^[(]{0,1}[0-9]{3}[)]{0,1}[-]{0,1}[0-9]{3}[-]{0,1}[0-9]{4}$')]),
      'email': new FormControl({
        value: null,
        disabled: this.operationMode === OperationMode.CREATED
      }, [Validators.required, Validators.email]),
      'projectName': new FormControl({
        value: null,
        disabled: this.operationMode === OperationMode.CREATED
      }, [Validators.required]),
      'proposedDate': new FormControl({
        value: null,
        disabled: this.operationMode === OperationMode.CREATED
      }, [Validators.required]),
      'honorificMention': new FormControl({
        value: 'false',
        disabled: this.operationMode === OperationMode.CREATED
      }, [Validators.required]),
      'numberParticipants': new FormControl({
        value: null,
        disabled: this.operationMode === OperationMode.CREATED
      }, [Validators.required, Validators.min(1)]),
      'projectFile': new FormControl({
        value: null,
        disabled: this.operationMode === OperationMode.CREATED
      }),
      'product': new FormControl({
        value: null,
        disabled: this.operationMode === OperationMode.CREATED
      }, [Validators.required]),
      'address': new FormControl({
        value: null,
        disabled: this.operationMode === OperationMode.CREATED
      }, [Validators.required]),
      'observations': new FormControl({ value: null }),
    });
  }

  loadRequestData(data: any) {
    this.requestData = data;
    this.formRequest.disable();
    this.formRequest.setValue({
      'name': data.graduate.name.firstName,
      'lastname': data.graduate.name.lastName,
      'telephone': data.telephoneContact,
      'email': data.graduate.email.toUpperCase(),
      'projectName': data.request.projectName,
      'proposedDate': this.dateFormat.transform(data.request.proposedDate, 'yyyy-MM-dd'),
      'honorificMention': `${data.request.honorificMention}`,
      'numberParticipants': data.request.numberParticipants,
      'projectFile': '',
      'product': data.request.product,
      'address': data.graduate.address,
      'observations': data.observations ? data.observations : '',
    });
  }

  onSave() {
    if (!this.projectFile) {
      this.notificationsServices.showNotification(3, 'Acto recepcional', 'Es obligatorio subir la carátula del proyecto');
      return;
    }
    this.formData = this.loadFormData();
    if (this.formData && this.operationMode === OperationMode.NEW && this.formRequest.valid) {
      this.academicDegreeProv.saveRequest(this.formData)
        .subscribe(request => {
          if (request.error) {
            return this.notificationsServices.showNotification(2, 'Acto recepcional', 'Ha ocurrido un error al crear la solicitud');
          }
          this.notificationsServices.showNotification(1, 'Acto recepcional', 'La solicitud se ha creado con éxito');
          this.operationMode = OperationMode.CREATED;
          this.requestData = request;
          this.formRequest.disable();
          this.formRequest.markAsUntouched();
        });
    }
  }

  onSaveEdited() {
    if (!this.projectFile) {
      this.notificationsServices.showNotification(3, 'Acto recepcional', 'Es obligatorio subir la carátula del proyecto');
      return;
    }
    this.formData = this.loadFormData();
    if (this.formData && this.operationMode === OperationMode.EDIT && this.formRequest.valid) {
      this.academicDegreeProv.editRequest(this.formData, this.requestData._id)
        .subscribe(request => {
          if (request.error) {
            return this.notificationsServices.showNotification(2, 'Acto recepcional', 'Ha ocurrido un error al editar la solicitud');
          }
          this.notificationsServices.showNotification(1, 'Acto recepcional', 'La solicitud se ha actualizado con éxito');
          this.operationMode = OperationMode.CREATED;
          this.requestData = request;
          this.formRequest.disable();
          this.formRequest.markAsUntouched();
        });
    }
  }

  sendRequest() {
    Swal.fire({
      title: '¿Todos los campos están correctos?',
      text: 'Después de enviar la solicitud no podrá hacer cambios.',
      type: 'question',
      showCancelButton: true,
      allowOutsideClick: false,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Enviar'
    }).then((result) => {
      if (result.value && this.operationMode === OperationMode.CREATED) {
        this.academicDegreeProv.updateRequestStatus({ newStatus: RequestStatus.SENT }, this.requestData._id)
          .subscribe(request => {
            if (request.error) {
              return this.notificationsServices.showNotification(2, 'Envío solicitud', 'Ha ocurrido un error al envíar la solicitud');
            }
            this.notificationsServices.showNotification(1, 'Solicitud', 'Su solicitud se ha enviado con éxito');
            this.operationMode = OperationMode.SENT;
            this.requestData.status = RequestStatus.SENT;
          });
      }
    });
  }

  loadFormData() {
    const data = {
      graduate: {
        name: {
          firstName: this.formRequest.get('name').value,
          lastName: this.formRequest.get('lastname').value,
          fullName: this.formRequest.get('name').value + ' ' + this.formRequest.get('lastname').value,
        },
        career: this.requestData ? this.requestData.graduate.career : '',
        controlNumber: this.user.email,
        address: this.formRequest.get('address').value,
        email: this.formRequest.get('email').value,
      },
      request: {
        projectName: this.formRequest.get('projectName').value,
        product: this.formRequest.get('product').value,
        numberParticipants: this.formRequest.get('numberParticipants').value,
        honorificMention: this.formRequest.get('honorificMention').value === 'true' ? true : false,
        proposedDate: this.formRequest.get('proposedDate').value,
        projectFile: this.projectFileName,
      },
      telephoneContact: this.formRequest.get('telephone').value,
      creationDate: this.requestData ? this.requestData.creationDate : new Date(),
      editionDate: new Date(),
      headProfessionalStudiesDivision: this.requestData ? this.requestData.headProfessionalStudiesDivision : '',
      degreeCoordinator: this.requestData ? this.requestData.degreeCoordinator : '',
      status: RequestStatus.CAPTURED,
    };
    return data;
  }

  onUploadFile(inputFile: HTMLInputElement) {
    const files = inputFile.files;
    if (files && files.length) {
      this.projectFileName = files[0].name;
      this.projectFile = files[0];
      this.notificationsServices.showNotification(1, 'Acto recepcional',
        'El archivo ' + this.projectFileName + ' se ha cargado correctamente');
      this.isUploadedFile = true;
    }
  }

  editionMode() {
    this.operationMode = OperationMode.EDIT;
    this.formRequest.enable();
  }

  cancelEdition() {
    this.operationMode = OperationMode.CREATED;
    this.formRequest.disable();
    this.formRequest.markAsUntouched();
    this.loadRequestData(this.requestData);
  }

  generateRequestPDF() {
    if (this.operationMode === OperationMode.CREATED || this.operationMode === OperationMode.SENT) {
      window.open(`http://104.248.94.77/escolares/credenciales/graduate/request/generate/${this.requestData._id}`);
    }
  }
}
