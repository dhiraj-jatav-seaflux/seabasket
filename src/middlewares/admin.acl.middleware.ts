import { UserEntity } from "@entities";
import { decode, getRepo } from "@helpers";
import { TRequest, TResponse, UserRole } from "@types";

export const adminAcl = async(req:TRequest,res:TResponse,next:()=>void)=>{
    const token = req.headers.authorization?.split(" ")[1];

    const tokenInfo = decode<any>(token);

    if (!tokenInfo || tokenInfo.message!==process.env.TOKEN_SECRET_MESSAGE) {
        res.status(401).send({ code: 401, reason: "Unauthorized!" });
        return;
      }
    
      const userRepository = getRepo(UserEntity);
      const user = await userRepository.findOne({
        where: { id: tokenInfo.id },
      });
    
      if (!user) {
        res.status(401).send({ code: 401, reason: "Unauthorized!" });
        return;
      }

      if(user.role !== UserRole.ADMIN){
        return res.status(401).json({message:'Unauthorized!'});
      }
    
      req.me = user;
    //   req.isAdmin = user.role === UserRole.ADMIN;
      next();
}
