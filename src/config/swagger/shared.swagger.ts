import { Express, Request, Response, NextFunction } from "express";
import swaggerUi from "swagger-ui-express";
import { logger } from "../logger";

interface ISwaggerConfig {
  key: string;
  spec: any;
}

const useSchema = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  swaggerUi.setup(schema)(req, res, next);
};

export const addSwaggerEndpoint = (
  app: Express,
  instances: ISwaggerConfig[]
): void => {
  const baseUrl = "/api/docs/";

  // Serve Swagger JSON for each instance
  instances.forEach((instance) => {
    app.get(`${baseUrl}${instance.key}/swagger.json`, (req: Request, res: Response) => {
      res.json(instance.spec);
    });
  });

  // Serve Swagger UI for each instance separately
  instances.forEach((instance) => {
    app.use(
      `${baseUrl}${instance.key}`,
      swaggerUi.serve,
      useSchema(instance.spec)
    );
  });
};
