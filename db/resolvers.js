const Usuario = require( '../models/Usuario' );
const Producto = require( '../models/Producto' );
const bcryptjs = require( 'bcryptjs' );
const jwt = require( 'jsonwebtoken' );
require( 'dotenv' ).config( { path: 'variables.env' } );


// Crear Token
const crearToken = ( usuario, secreta, expiresIn ) => {
  // console.log( usuario );
  const { id, email, nombre, apellido } = usuario;
  return jwt.sign( {
    // payload
    id,
    nombre,
    apellido,
    email
  }, secreta, {
    // configuración del token
    expiresIn
  } )
};

// Resolvers
const resolvers = {
  Query: {
    obtenerUsuario: async ( _, { token } ) => {
      const usuarioId = await jwt.verify( token, process.env.SECRETO );
      return usuarioId;
    },
    obtenerProductos: async () => {
      try {
        const productos = await Producto.find( {} );
        return productos;
      } catch ( error ) {
        console.log( 'Error al obtener productos' );
        console.log( error );
      }
    },
    obtenerProducto: async ( _, { id } ) => {
      // Revisar si el producto existe
      const producto = await Producto.findById( id );
      if ( !producto ) {
        throw new Error( 'Producto no encontrado.' );
      }
      return producto;
    }
  },
  Mutation: {
    nuevoUsuario: async ( _, { input } ) => {

      const { email, password } = input;

      // Revisar si el usuario existe
      const existeUsuario = await Usuario.findOne( { email } );
      if ( existeUsuario ) {
        throw new Error( 'El usuario ya existe' );
      }

      // Hashear el password
      const salt = await bcryptjs.genSalt( 10 );
      input.password = await bcryptjs.hash( password, salt );

      // Guardar el usuario en la base de datos
      try {
        const usuario = new Usuario( input ); // Crear el objeto usuario
        usuario.save(); // Guardar el usuario en la base de datos
        return usuario; // Retornar el usuario
      } catch ( error ) {
        console.log( 'Error al guardar en la base de datos...' );
        console.log( error );
      }

      return 'Creando Usuario...';
    },
    autenticarUsuario: async ( _, { input } ) => {
      const { email, password } = input;
      // Revisar si el usuario existe
      const existeUsuario = await Usuario.findOne( { email } );
      if ( !existeUsuario ) {
        throw new Error( 'El usuario no existe.' );
      }

      // Revisar el password
      const passwordCorrecto = await bcryptjs.compare( password, existeUsuario.password );
      if ( !passwordCorrecto ) {
        throw new Error( 'El password es incorrecto.' );
      }

      // Crear el token
      return {
        token: crearToken( existeUsuario, process.env.SECRETO, '1h' )
      }
    },
    nuevoProducto: async ( _, { input } ) => {
      try {
        const nuevoProducto = new Producto( input );

        // Guardar el producto en la base de datos
        const producto = await nuevoProducto.save();
        return producto;
      } catch ( error ) {
        console.log( 'Error al guardar en la base de datos...' );
        console.log( error );
      }
    },
    actualizarProducto: async ( _, { id, input } ) => {
      // Revisar si el producto existe
      let producto = await Producto.findById( id );
      if ( !producto ) {
        throw new Error( 'Producto no encontrado.' );
      }

      // Actualizar el producto en la base de datos
      producto = await Producto.findOneAndUpdate( { _id: id }, input, { new: true } );

      return producto;
    },
    eliminarProducto: async ( _, { id } ) => {
      // Revisar si el producto existe
      const producto = await Producto.findById( id );
      if ( !producto ) {
        throw new Error( 'Producto no encontrado.' );
      }

      // Eliminar el producto de la base de datos
      await Producto.findOneAndDelete( { _id: id } );
      return 'Producto eliminado correctamente.';
    }
  }
}

module.exports = resolvers;