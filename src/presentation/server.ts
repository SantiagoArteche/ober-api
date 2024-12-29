import express from "express";
import "dotenv/config";
import { AppRouter } from "./routes";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";

export class AppServer {
  private app = express();
  private PORT = process.env.PORT ?? 8000;

  public start = () => {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(
      rateLimit({
        windowMs: 10 * 60 * 1000,
        max: 100,
        message: {
          msg: "Too many requests from this IP, please try again later.",
        },
        standardHeaders: true,
        legacyHeaders: false,
      })
    );

    this.app.use(AppRouter.routes());

    this.app.listen(this.PORT, () => {
      console.log(`Server running on PORT: ${this.PORT}`);
    });
  };
}
