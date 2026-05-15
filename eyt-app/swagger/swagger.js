const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ENDTask API',
      version: '1.0.0',
      description: 'Documentación oficial de la API de ENDTask',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local'
      }
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            title: {
              type: 'string',
              example: 'Completar documentación Swagger'
            },
            completed: {
              type: 'boolean',
              example: false
            }
          }
        },

        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            email: {
              type: 'string',
              example: 'usuario@gmail.com'
            }
          }
        }
      }
    }
  },

  apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
