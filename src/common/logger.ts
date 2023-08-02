type LoggerArgsType = {
  status: "Info" | "Debug" | "Warning" | "Error";
  path: string;
  message: string;
  value: unknown;
};

const commonLogger = (args: LoggerArgsType): void => {
  const { path, message, value, status } = args;
  console.log("----------------------------");
  console.log(`--------------`);
  console.log(`${status}: [${path}]`);
  console.log(`message: ${message}`);
  console.log(JSON.stringify(value, null, 4));
};

export class Logger {
  public static debug = (value: unknown): void => {
    if (process.env.NODE_ENV === "production") return;
    console.log("============================");
    console.log("Debug env only!!!");
    commonLogger({ status: "Debug", message: "", path: "*", value });
  };

  public static info = (
    path: string,
    message: string,
    value: unknown
  ): void => {
    commonLogger({ status: "Info", path, message, value });
  };

  public static error = (
    path: string,
    message: string,
    value: unknown
  ): void => {
    commonLogger({ status: "Error", path, message, value });

    if (typeof value === "undefined") return;
  };

  public static warning = (
    path: string,
    message: string,
    value: unknown
  ): void => {
    commonLogger({ status: "Warning", path, message, value });
  };

  public static div = (num: string | number = 1): void => {
    if (process.env.NODE_ENV === "production") return;
    console.log(num + "============================");
    console.log(num + "============================");
    console.log(num + "============================");
    console.log(num + "============================");
  };
}
