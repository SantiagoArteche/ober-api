import mongoose from "mongoose";
import "dotenv/config";

export class MongoDB {
  public static init = async () => {
    await mongoose
      .connect(process.env.MONGO_URI!, {
        dbName: process.env.MONGO_DBNAME,
      })
      .then(() => console.log(`MongoDB connected`))
      .catch((error) => console.log(error));
  };

  public static disconnect = async () => {
    await mongoose.disconnect();
  };
}
