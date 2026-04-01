import { UserEntity } from "@entities";
import { decode, getRepo } from "@helpers";
import { TRequest, TResponse, UserRole } from "@types";

export const acl = async (req: TRequest, res: TResponse, next: () => void) => {
  const token = req.headers.authorization?.split(" ")[1];

  const tokenInfo = decode<any>(token);

  if (!tokenInfo || tokenInfo.message!==process.env.TOKEN_SECRET_MESSAGE) {
    res.status(401).send({ code: 401, reason: "Unauthorized!" });
    return;
  }

  const userRepository = getRepo(UserEntity);
  const user = await userRepository.findOne({
    where: { id: tokenInfo.id },
    relations:{
      addresses:true
    }
  });

  if (!user) {
    res.status(401).send({ code: 401, reason: "Unauthorized!" });
    return;
  }

  req.me = user;
  // req.isAdmin = user.role === UserRole.ADMIN;
  next();
};