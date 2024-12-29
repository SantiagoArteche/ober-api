import winston from "winston";

type LogLevel = "fatal" | "error" | "warning" | "info" | "debug";

class Logger {
  private mode: string = process.env.NODE_ENV!;
  private customLevels: {
    levels: Record<LogLevel, number>;
    colors: Record<LogLevel, string>;
  };
  private logger: winston.Logger;

  constructor() {
    this.customLevels = {
      levels: {
        fatal: 0,
        error: 1,
        warning: 2,
        info: 3,
        debug: 4,
      },
      colors: {
        fatal: "red",
        error: "magenta",
        warning: "yellow",
        info: "cyan",
        debug: "gray",
      },
    };

    winston.addColors(this.customLevels.colors);
    this.logger = winston.createLogger({
      levels: this.customLevels.levels,
      transports: this.createTransports(),
    });
  }

  private createTransports(): winston.transport[] {
    const transports: winston.transport[] = [
      new winston.transports.File({
        filename: "./logs/errors.log",
        level: "fatal",
        format: winston.format.simple(),
      }),
      new winston.transports.File({
        filename: "./logs/errors.log",
        level: "error",
        format: winston.format.simple(),
      }),
      new winston.transports.File({
        filename: "./logs/warnings.log",
        level: "warning",
        format: winston.format.simple(),
      }),
      new winston.transports.File({
        filename: "./logs/info.log",
        level: "info",
        format: winston.format.simple(),
      }),
    ];

    if (this.mode === "development") {
      transports.unshift(
        new winston.transports.Console({
          level: "debug",
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        })
      );
    }

    return transports;
  }

  public log(level: LogLevel, message: string): void {
    this.logger.log(level, `${message} - ${new Date()}`);
  }

  public fatal(message: string): void {
    this.logger.log("fatal", `${message} - ${new Date()}`);
  }

  public error(message: string): void {
    this.logger.log("error", `${message} - ${new Date()}`);
  }

  public warning(message: string): void {
    this.logger.log("warning", `${message} - ${new Date()}`);
  }

  public info(message: string): void {
    this.logger.log("info", `${message} - ${new Date()}`);
  }

  public debug(message: string): void {
    this.logger.log("debug", `${message} - ${new Date()}`);
  }
}

export default Logger;
