import mongoose from "mongoose";
import "dotenv/config";

export class MongoDB {
  public static init = async () => {
    const MONGO_URI: string =
      process.env.NODE_ENV! === "development"
        ? process.env.MONGO_TEST_URI!
        : process.env.MONGO_URI!;

    await mongoose
      .connect(MONGO_URI, {
        dbName: process.env.MONGO_DBNAME,
      })
      .then(() =>
        console.log(
          process.env.NODE_ENV! === "development"
            ? `MongoDB development db connected`
            : "MongoDB db connected"
        )
      )
      .catch((error) => console.log(error));
  };

  public static disconnect = async () => {
    await mongoose.disconnect();
  };
}
