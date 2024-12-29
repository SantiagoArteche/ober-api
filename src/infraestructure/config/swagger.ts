import path from "path";

const docsRoute = path.resolve(
  `${__dirname}`,
  "../../presentation/docs/*.yaml"
);

export const swaggerOptions = {
  definition: {
    info: {
      title: "Oberstaff API",
      version: "0.0.1",
      description: "API made for Oberstaff",
      contact: {
        name: "Santiago Arteche",
        url: "https://portfolioarteche.vercel.app/",
        email: "santiagoarteche7@gmail.com",
      },
    },
    openapi: "3.1.0",
    servers: [
      {
        url: "http://localhost:8000",
      },
    ],
  },
  apis: [docsRoute],
};
