import { ObjectId } from "mongodb";

export type LibroModel={
    _id: ObjectId,
    title: string,
    author: string,
    year: number
}

export type Libro={
    id: string,
    title: string,
    author: string,
    year: number
}