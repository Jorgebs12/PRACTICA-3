import type { LibroModel, Libro } from "./types.ts";

export const fromModelToBook = (model: LibroModel): Libro => ({
    id: model._id.toString(),
    title: model.title,
    author: model.author,
    year: model.year,
});