import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { eFILES } from 'src/app/enumerators/reception-act/document.enum';

@Pipe({ name: 'documentType' })
export class DocumentTypePipe implements PipeTransform {
    constructor() { }
    transform(value: String) {
        let name = 'DEFAULT';
        switch (value) {
            case eFILES.PROYECTO: {
                name = "PORTADA DE PROYECTO";
                break;
            }
            case eFILES.SOLICITUD: {
                name = "SOLICITUD DE PROYECTO";
                break;
            }
            case eFILES.REGISTRO: {
                name = "REGISTRO DE PROYECTO";
                break;
            }
            case eFILES.RELEASED: {
                name = "CONSTANCIA DE LIBERACION";
                break;
            }
            case eFILES.INCONVENIENCE: {
                name = "CONSTANCIA DE NO INCONVENIENCIA"
                break;
            }
            case eFILES.ACTA_NACIMIENTO: {
                name = "ACTA DE NACIMIENTO";
                break;
            }
            case eFILES.CURP: {
                name = "CURP";
                break;
            }
            case eFILES.CERTIFICADO_B: {
                name = "CERTIFICADO DE BACHILLERATO";
                break;
            }
            case eFILES.CEDULA: {
                name = "CÉDULA TÉCNICA";
                break;
            }
            case eFILES.CERTIFICADO_L: {
                name = "CERTIFICADO PROFESIONAL";
                break;
            }
            case eFILES.SERVICIO: {
                name = "SERVICIO SOCIAL";
                break;
            }
            case eFILES.INGLES: {
                name = "CONSTANCIA DE INGLÉS";
                break;
            }
            case eFILES.PAGO: {
                name = "COMPROBANTE DE PAGO";
                break;
            }
            case eFILES.CERTIFICADO_R: {
                name = "CERTIFICADO DE REVALIDACIÓN";
                break;
            }
            case eFILES.PHOTOS: {
                name = "FOTOGRAFÍAS";
                break;
            }
            case eFILES.ACTA_EXAMEN: {
                name = "ACTA DE EXAMEN";
                break;
            }
            case eFILES.INE: {
                name = "CREDENCIAL DE ELECTOR";
                break;
            }
            case eFILES.CED_PROFESIONAL: {
                name = "CÉDULA PROFESIONAL";
                break;
            }
            case eFILES.XML: {
                name = "XML DE CÉDULA";
                break;
            }
            default: {
                name = "DESCONOCIDO";
            }
        }
        return name;
    }
} 