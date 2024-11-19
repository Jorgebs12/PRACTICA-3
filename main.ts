import { MongoClient, ObjectId } from "mongodb"
import { LibroModel } from "./types.ts"
import { fromModelToBook } from "./controller.ts";

const MONGO_URL = Deno.env.get("MONGO_URL")
if(!MONGO_URL){
  console.error("MONGO no conectado")
  Deno.exit(1)
}

const client = new MongoClient(MONGO_URL)
await client.connect()

console.log("Conectado a mongo")

const db = client.db("Libros");
const booksCollection = db.collection<LibroModel>("books");

const handler = async (req: Request): Promise<Response> => {
  const method = req.method;
  const url = new URL(req.url);
  const path = url.pathname;
  
  if (method === "POST") {     
    if (path === "/book") {

      const book = await req.json();
      
      if (!book.title || !book.author || !book.year) return new Response("Bad request", { status: 400 });
      
      const { insertedId } = await booksCollection.insertOne({
        _id: new ObjectId(),
        title: book.title,
        author: book.author,
        year: book.year,
      });

      return new Response(JSON.stringify({
          title: book.title,
          author: book.author,
          year: book.year,
          id: insertedId,
          
        }),{ status: 201 }
      );
    }

    /*
    { 
    "title": "El principito", 
    "author": "Antoine de Saint-Exupéry", 
    "year": 1943 
    }
    */
  
  } else if (method === "GET") {
    if (path === "/books") {
      
      const booksAll = await booksCollection.find().toArray();
      const misBooks = booksAll.map((todosLibros) => fromModelToBook(todosLibros));
      
      return new Response(JSON.stringify(misBooks));
    

    } else if (path.startsWith("/books")) {

      //Para coger la ultima posicion de la url y borrarlo
      const id = path.split("/").pop();
      if (!id) return new Response("El id no es correcto", { status: 400 });
    
      const bookID = await booksCollection.findOne({ _id: new ObjectId(id) });
      if (!bookID) return new Response("Ese libro que buscas no existe...", { status: 404 });

      return new Response(JSON.stringify(bookID));
    }

  } else if (method === "PUT") {
    if (path.startsWith("/books")) {
      //Para coger la ultima posicion de la url y borrarlo
      const id = path.split("/").pop();
      if (!id) return new Response("El id no es correcto", { status: 400 });

     const libroUpdate = await req.json();
     if (!libroUpdate.title || !libroUpdate.author || !libroUpdate.year) return new Response("Bad request", { status: 400 });

     const { modifiedCount } = await booksCollection.updateOne(
       { _id: new ObjectId(id as string) },
       { $set: { title: libroUpdate.title, author: libroUpdate.author, year: libroUpdate.year } } );

     if (modifiedCount === 0) return new Response("Ese libro que buscas no existe...", { status: 404 });
     
     return new Response("Libro actualizado correctamente", { status: 200 });
   }

  } else if (method === "DELETE") {
    if (path.startsWith("/books")) {
      //Para coger la ultima posicion de la url y borrarlo
      const id = path.split("/").pop();
      
      if (!id) return new Response("El id no es correcto", { status: 400 });
      
      const { deletedCount } = await booksCollection.deleteOne({_id: new ObjectId(id)});

      if (deletedCount === 0) return new Response("Ese libro que buscas no existe...", { status: 404 });
      
      return new Response("Libro borrado con exito! :(", { status: 200 });
    }
  }
  
  return new Response("La ruta no es valida", { status: 404 });
};

Deno.serve({ port: 4000 }, handler);