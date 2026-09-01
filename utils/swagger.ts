import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Zero English API",
      version: "1.0.0",
      description: "API documentation for Zero English",
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development",
      },
    ],
  },

  apis: ["./app/api/**/*.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);