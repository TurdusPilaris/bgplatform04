// import jwt from 'jsonwebtoken'

// import {PayloadTokenType} from "../../input-output-types/common/common-types";
// import { Injectable } from "@nestjs/common";
// @Injectable()
// export class JWTService {
//   async createToken(payload: any, expiresTime: string, SECRET_CODE: string) {
//     return jwt.sign(
//       payload,
//       // {userId: userId},
//       SECRET_CODE,
//       {
//         expiresIn: expiresTime,
//       },
//     );
//   }
//     async decodeToken(token: string): Promise<any> {
//       try {
//           return jwt.decode(token);
//       }catch (e: unknown){
//           console.error("Cant decode token", e);
//           return null;
//       }
//     }
//     async verifyAndGetPayloadToken(token: string, secretCode:string):Promise<PayloadTokenType|null> {
//
//         try {
//             const result: any = jwt.verify(token, secretCode)
//             if(result.deviceId){
//                 return {userId: result.userId, deviceId: result.deviceId}
//             } else return {userId: result.userId};
//         } catch (error) {
//             console.log("Not verify!")
//             return null
//         }
//     }
//
// }
