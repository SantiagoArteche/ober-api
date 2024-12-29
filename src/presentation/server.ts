import express from "express";
import "dotenv/config";
import { AppRouter } from "./routes";
import cors from "cors";

export class AppServer {
  private app = express();
  private PORT = process.env.PORT ?? 8000;

  public start = () => {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());

    this.app.use(AppRouter.routes());

    this.app.listen(this.PORT, () => {
      console.log(`Server running on PORT: ${this.PORT}`);
    });
  };
}
