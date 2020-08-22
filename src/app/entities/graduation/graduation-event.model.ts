export interface IGraduationEvent {  
    id: string;
    status: string;
    date: Date;
    limitDate: Date;
    hour: number;
    directorName: string;
    directorMessage: string;
    totalTickets: number;
    studentTickets: number;
    observationsMessage: string;
    hourGallery: number;
}