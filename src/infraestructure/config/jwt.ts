import jwt from "jsonwebtoken";
import "dotenv/config";

interface Payload {
  id: string;
  email: string;
}

export class JWT {
  public static generate = (
    payload: Payload,
    duration: string = "2h"
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      return jwt.sign(
        payload,
        process.env.PRIVATE_JWT!,
        { expiresIn: duration },
        (error, token) => {
          if (error) reject(error);

          resolve(token as string);
        }
      );
    });
  };

  public static decode = (token: string): Promise<Payload> => {
    return new Promise((resolve, reject) => {
      return jwt.verify(token, process.env.PRIVATE_JWT!, (error, decode) => {
        if (error) reject(error);

        resolve(decode as Payload);
      });
    });
  };
}
