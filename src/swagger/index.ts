import { Router } from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options: swaggerJsDoc.Options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "BEMS-HDMS Api Document",
      description: "BEMS-HDMS Api Document",
    },
  },
  apis: ["./src/routes/**/*.ts", "./src/models/**/*.ts"],
};

const swaggerRoutes = Router();
swaggerRoutes.use(swaggerUi.serve, swaggerUi.setup(swaggerJsDoc(options)));

export default swaggerRoutes;
