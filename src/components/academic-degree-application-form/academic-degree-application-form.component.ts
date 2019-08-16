import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';

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
  private formData: FormData;
  private operationMode: Number = 0;
  private msnObservations: string[] = [
    'Observación 1',
    'Observación 2',
    'Observación 3',
  ];
  private isLoadImage: boolean;
  private resource: string;
  private isUploadedFile: boolean;
  private projectFileName: string;
  private projectFile: any;

  constructor(
    private academicDegreeProv: AcademicDegreeApplicationProvider,
    private cookiesService: CookiesService,
    private notificationsServices: NotificationsServices,
  ) {
    this.user = this.cookiesService.getData().user;
    this.isUploadedFile = false;
    this.resource = '';
  }

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.formRequest = new FormGroup({
      'name': new FormControl({ value: this.user.name.firstName, disabled: false }, [Validators.required]),
      'lastname': new FormControl({ value: this.user.name.lastName, disabled: false }, [Validators.required]),
      'telephone': new FormControl({ value: null, disabled: false  },
        [Validators.required, Validators.pattern('^[(]{0,1}[0-9]{3}[)]{0,1}[-]{0,1}[0-9]{3}[-]{0,1}[0-9]{4}$')]),
      'email': new FormControl({ value: null, disabled: false }, [Validators.required, Validators.email]),
      'projectName': new FormControl({ value: null, disabled: false }, [Validators.required]),
      'proposedDate': new FormControl({ value: null, disabled: false }, [Validators.required]),
      'honorificMention': new FormControl({ value: 'false', disabled: false }, [Validators.required]),
      'numberParticipants': new FormControl({ value: null, disabled: false }, [Validators.required, Validators.min(1)]),
      'projectFile': new FormControl(null),
      'observations': new FormControl(null),
    });
  }

  onSave() {
    if (!this.projectFile) {
      this.notificationsServices.showNotification(3, 'Acto recepcional', 'Es obligatorio subir la carátula del proyecto');
      return;
    }
    this.formData = this.loadData();
    if (this.formData) {
      this.academicDegreeProv.saveRequest(this.formData)
        .subscribe(res => {
          console.log(res);
        });
    }
  }

  loadData() {
    const formData = new FormData();
    formData.append('name', this.formRequest.get('name').value);
    formData.append('lastname', this.formRequest.get('lastname').value);
    formData.append('telephone', this.formRequest.get('telephone').value);
    formData.append('email', this.formRequest.get('email').value);
    formData.append('projectName', this.formRequest.get('projectName').value);
    formData.append('proposedDate', this.formRequest.get('proposedDate').value);
    formData.append('honorificMention', this.formRequest.get('honorificMention').value);
    formData.append('numberParticipants', this.formRequest.get('numberParticipants').value);
    formData.append('projectFile', this.projectFile);
    return formData;
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
}
