export type DatabaseTable = {
    slug: string;
    displayName: string;
    indexData?: any;
    createdAt: number;
}

export interface DatabaseRecord<T>{
    id:string;
    createdAt:number;
    updatedAt:number;
    data:T;
}