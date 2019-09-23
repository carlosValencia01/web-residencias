export class sourceDataProvider {
    getCareers(): string[] {
        return [
            'Seleccione la Carrera',
            'ARQUITECTURA',
            'INGENIERÍA BIOQUÍMICA',
            'INGENIERÍA ELÉCTRICA',
            'INGENIERÍA EN GESTIÓN EMPRESARIAL',
            'INGENIERÍA INDUSTRIAL',
            'INGENIERÍA MECATRÓNICA',
            'INGENIERÍA QUÍMICA',
            'INGENIERÍA EN SISTEMAS COMPUTACIONALES',
            'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES',
            'LICENCIATURA EN ADMINISTRACIÓN',
            'MAESTRIA EN TECNOLOGÍAS DE LA INFORMACIÓN',
            'MAESTRIA EN CIENCIAS DE ALIMENTOS',
            'DOCTORADO EN CIENCIAS DE ALIMENTOS'
        ];
    }

    getGrades(): string[] {
        return [
            'Seleccione el nivel académico',
            'LICENCIATURA',
            'MAESTRÍA',
            'DOCTORADO',
        ];
    }
}
