type LoggerArgsType = {
  status: "INFO" | "DEBUG" | "WARNING" | "ERROR";
  path: string;
  message: string;
  value: unknown;
};

const commonLogger = (args: LoggerArgsType): void => {
  const { path, message, value, status } = args;
  console.log("===============================");
  console.log(`${status}: [${path}]`);
  console.log(`message: ${message}`);
  console.log(JSON.stringify(value, null, 4));
  console.log("===============================");
};

export class Logger {
  public static debug = (message: string, value: unknown): void => {
    if (process.env.NODE_ENV === "production") return;
    commonLogger({ status: "DEBUG", path: "*", message, value });
  };

  public static info = (
    path: string,
    message: string,
    value: unknown
  ): void => {
    commonLogger({ status: "INFO", path, message, value });
  };

  public static warning = (
    path: string,
    message: string,
    value: unknown
  ): void => {
    commonLogger({ status: "WARNING", path, message, value });
  };

  public static error = (
    path: string,
    message: string,
    value: unknown
  ): void => {
    commonLogger({ status: "ERROR", path, message, value });

    if (typeof value === "undefined") return;
  };
}
