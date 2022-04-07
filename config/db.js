const mongoose = require( 'mongoose' );
require( 'dotenv' ).config( { path: 'variables.env' } );

const conectarDB = async () => {
  try {
    await mongoose.connect( process.env.DB_MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    } );
    console.log( 'DB conectada' );
  } catch ( error ) {
    console.log( 'Error al conectar a la base de datos' );
    console.log( error );
    process.exit( 1 ); // Detener la ejecución del programa
  }
}

module.exports = conectarDB;