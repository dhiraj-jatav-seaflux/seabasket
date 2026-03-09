import { CategoriesEntity, ProductImagesEntity, ProductsEntity, UserEntity } from "@entities";
import { envValidator, getLogger } from "@helpers";
import { DataSource } from "typeorm";

let dataSource: DataSource | null = null;

const logger = getLogger();

export const initializeDB = async () => {
  const envs = envValidator();

  if (!dataSource) {
    dataSource = new DataSource({
      type: "mysql",
      host: envs.dbHost,
      port: envs.dbPort,
      username: envs.dbUser,
      password: envs.dbPassword,
      database: envs.dbName,
      // schema: envs.dbSchema,
      entities: [UserEntity,CategoriesEntity,ProductImagesEntity,ProductsEntity],
    });

    try {
      await dataSource.initialize();
      logger.info("DB Connection has been established successfully.");
    } catch (error) {
      logger.error(`Unable to connect to the database: ${error}`);
    }
  }

  return dataSource;
};

export const getDB = () => {
  if (!dataSource) {
    throw new Error("Database has not been initialized. Call initializeDB first.");
  }

  return dataSource;
};
