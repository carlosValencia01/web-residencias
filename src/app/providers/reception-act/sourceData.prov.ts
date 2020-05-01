export class sourceDataProvider {
    getCareers(): string[] {
        return [
            'Seleccione la Carrera',
            'ARQUITECTURA',
            'INGENIERÍA BIOQUÍMICA',
            'INGENIERÍA CIVIL',
            'INGENIERÍA ELÉCTRICA',
            'INGENIERÍA EN GESTIÓN EMPRESARIAL',
            'INGENIERÍA INDUSTRIAL',
            'INGENIERÍA MECATRÓNICA',
            'INGENIERÍA QUÍMICA',
            'INGENIERÍA EN SISTEMAS COMPUTACIONALES',
            'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES',
            'LICENCIATURA EN ADMINISTRACIÓN',
            'MAESTRÍA EN TECNOLOGÍAS DE LA INFORMACIÓN',
            'MAESTRÍA EN CIENCIAS EN ALIMENTOS',
            'DOCTORADO EN CIENCIAS EN ALIMENTOS'
        ];
    }

    getCareerAbbreviation(): { carrer: string, class: string, abbreviation: string, icon: string, status: boolean, color: { primary: string; secondary: string; } }[] {
        return [
            {
                carrer: 'ARQUITECTURA', class: 'circulo-arqu', abbreviation: 'ARQU', icon: 'arq.png', status: true, color: { primary: '#5E50F9', secondary: '#ccd6ff' }
            },
            {
                carrer: 'INGENIERÍA BIOQUÍMICA', class: 'circulo-ibqa', abbreviation: 'IBQA', icon: 'ibq.png', status: true, color: { primary: '#6610f2', secondary: '#d9c4fd' }
            },
            {
                carrer: 'INGENIERÍA CIVIL', class: 'circulo-iciv', abbreviation: 'ICIV', icon: 'ic.png', status: true, color: { primary: '#00c000', secondary: '#66ff66' }
            },
            {
                carrer: 'INGENIERÍA ELÉCTRICA', class: 'circulo-iele', abbreviation: 'IELE', icon: 'ie.png', status: true, color: { primary: '#E91E63', secondary: '#ffb3ff' }
            },
            {
                carrer: 'INGENIERÍA EN GESTIÓN EMPRESARIAL', class: 'circulo-igem', abbreviation: 'IGEM', icon: 'ige.png', status: true, color: { primary: '#f96868', secondary: '#ff6666' }
            },
            {
                carrer: 'INGENIERÍA INDUSTRIAL', class: 'circulo-iind', abbreviation: 'IIND', icon: 'ii.png', status: true, color: { primary: '#f2a654', secondary: '#ffb366' }
            },
            {
                carrer: 'INGENIERÍA MECATRÓNICA', class: 'circulo-imct', abbreviation: 'IMCT', icon: 'imc.png', status: true, color: { primary: '#f6e84e', secondary: '#ffff66' }
            },
            {
                carrer: 'INGENIERÍA QUÍMICA', class: 'circulo-iqui', abbreviation: 'IQUI', icon: 'iq.png', status: true, color: { primary: '#46c35f', secondary: '#b3ff66' }
            },
            {
                carrer: 'LICENCIATURA EN ADMINISTRACIÓN', class: 'circulo-ladm', abbreviation: 'LADM', icon: 'la.png', status: true, color: { primary: '#aab2bd', secondary: '#d5d9de' }
            },
            {
                carrer: 'INGENIERÍA EN SISTEMAS COMPUTACIONALES', class: 'circulo-isic', abbreviation: 'ISIC', icon: 'isc.png', status: true, color: { primary: '#58d8a3', secondary: '#acecd1' }
            },
            {
                carrer: 'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES', class: 'circulo-itic', abbreviation: 'ITIC', icon: 'itic.png', status: true, color: { primary: '#57c7d4', secondary: '#ace3ea' }
            }
        ]
    }

    // getCareerAbbreviation(): { carrer: string, class: string, abbreviation: string, icon: string, status: boolean, color: { primary: string; secondary: string; } }[] {
    //     return [
    //         {
    //             carrer: 'ARQUITECTURA', class: 'circulo-arqu', abbreviation: 'ARQU', icon: 'fa fa-bank', status: false, color: { primary: '#5E50F9', secondary: '#ccd6ff' }
    //         },
    //         {
    //             carrer: 'INGENIERÍA BIOQUÍMICA', class: 'circulo-ibqa', abbreviation: 'IBQA', icon: 'fa fa-eyedropper', status: false, color: { primary: '#6610f2', secondary: '#d9c4fd' }
    //         },
    //         {
    //             carrer: 'INGENIERÍA CIVIL', class: 'circulo-iciv', abbreviation: 'ICIV', icon: 'fa fa-building', status: false, color: { primary: '#00c000', secondary: '#66ff66' }
    //         },
    //         {
    //             carrer: 'INGENIERÍA ELÉCTRICA', class: 'circulo-iele', abbreviation: 'IELE', icon: 'fa fa-bolt', status: false, color: { primary: '#E91E63', secondary: '#ffb3ff' }
    //         },
    //         {
    //             carrer: 'INGENIERÍA EN GESTIÓN EMPRESARIAL', class: 'circulo-igem', abbreviation: 'IGEM', icon: 'fa fa-users', status: false, color: { primary: '#f96868', secondary: '#ff6666' }
    //         },
    //         {
    //             carrer: 'INGENIERÍA INDUSTRIAL', class: 'circulo-iind', abbreviation: 'IIND', icon: 'fa fa-industry', status: false, color: { primary: '#f2a654', secondary: '#ffb366' }
    //         },
    //         {
    //             carrer: 'INGENIERÍA MECATRÓNICA', class: 'circulo-imct', abbreviation: 'IMCT', icon: 'fa fa-microchip', status: false, color: { primary: '#f6e84e', secondary: '#ffff66' }
    //         },
    //         {
    //             carrer: 'INGENIERÍA QUÍMICA', class: 'circulo-iqui', abbreviation: 'IQUI', icon: 'fa fa-flask', status: true, color: { primary: '#46c35f', secondary: '#b3ff66' }
    //         },
    //         {
    //             carrer: 'LICENCIATURA EN ADMINISTRACIÓN', class: 'circulo-ladm', abbreviation: 'LADM', icon: 'fa fa-line-chart', status: false, color: { primary: '#aab2bd', secondary: '#d5d9de' }
    //         },
    //         {
    //             carrer: 'INGENIERÍA EN SISTEMAS COMPUTACIONALES', class: 'circulo-isic', abbreviation: 'ISIC', icon: 'fa fa-laptop', status: true, color: { primary: '#58d8a3', secondary: '#acecd1' }
    //         },
    //         {
    //             carrer: 'INGENIERÍA EN TECNOLOGÍAS DE LA INFORMACIÓN Y COMUNICACIONES', class: 'circulo-itic', abbreviation: 'ITIC', icon: 'fa fa-phone', status: false, color: { primary: '#57c7d4', secondary: '#ace3ea' }
    //         }
    //     ]
    // }
    getGrades(): string[] {
        return [
            'Seleccione el nivel académico',
            'LICENCIATURA',
            'MAESTRÍA',
            'DOCTORADO',
        ];
    }
}
