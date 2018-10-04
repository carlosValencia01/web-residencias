import { Injectable } from '@angular/core';
import { FormGroup, ValidationErrors } from '@angular/forms';
import { FormErrors } from 'src/commons/datatypes/form.errors.datatype';

@Injectable()

export class FormErrorsService {
    arrayResponse: Array<FormErrors> = [];


    getErros(form: FormGroup): Array<FormErrors> {
        this.arrayResponse = [];

        Object.keys(form.controls).forEach(key => {
            const controlErrors: ValidationErrors = form.get(key).errors;
            if (controlErrors != null) {
                Object.keys(controlErrors).forEach(keyError => {
                    this.arrayResponse.push({keyControl: key, keyError: keyError, errValue: controlErrors[keyError] });
                });
            }
        });

        return this.arrayResponse;
    }

}
