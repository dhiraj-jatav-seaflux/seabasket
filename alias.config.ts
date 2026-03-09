import path from "path";

const resolvePath = (dir: string) => path.resolve(__dirname, "src", dir);

export const alias = {
  "@index": resolvePath(""),
  "@db": resolvePath("db"),
  "@entities": resolvePath("db/entities"),
  "@helpers": resolvePath("helpers"),
  "@types": resolvePath("types"),
  "@modules": resolvePath("modules"),
  "@middlewares": resolvePath("middlewares"),
  "@configs": resolvePath("configs"),
  "@acl": resolvePath("acl"),
};
