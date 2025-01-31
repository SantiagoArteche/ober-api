import { MongoDB } from "./infraestructure/data/mongo-db/init";
import { AppServer } from "./presentation/server";

const main = async () => {
  const server = new AppServer();
  await server.start();
  await MongoDB.init();
};

(async () => {
  await main();
})();
