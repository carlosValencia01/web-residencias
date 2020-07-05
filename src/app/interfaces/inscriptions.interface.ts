export interface StudentsExpedient {  
    fullName: string;
    controlNumber: string;
    career: string;
    avance: string;
    status: string;
    exp?: string;
    medicDict?:string;
    medicWarn?:string;
}

export interface Career{
    fullName: string;
    acronym: string;
    shortName: string;
    _id: string;
    grade: { 
        female: String,
        male: string
    }
}