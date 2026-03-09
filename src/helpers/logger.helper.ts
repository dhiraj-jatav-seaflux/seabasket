import { createLogger, format, transports } from "winston";

const { combine, timestamp, colorize, metadata, label } = format;

const loggerInstances: Record<string, ReturnType<typeof createLogger>> = {};

function getCallerFilePath() {
  const err = new Error();
  const stack = err.stack?.split("\n");
  if (!stack) return undefined;
  const callerLine = stack[3] || stack[2];
  if (!callerLine) return undefined;
  const match = callerLine.match(/\((.*):(\d+):(\d+)\)/) || callerLine.match(/at (.*):(\d+):(\d+)/);
  if (match) {
    return match[1];
  }
  return undefined;
}

export const getLogger = (labelName?: string) => {
  let labelToUse = labelName;
  if (!labelToUse) {
    const callerPath = getCallerFilePath();
    labelToUse = callerPath ? callerPath.replace(`${process.cwd()}/`, "") : "no-label";
  }
  if (loggerInstances[labelToUse]) return loggerInstances[labelToUse];

  const logFormat = format.printf(info => {
    const { metadata: logMeta, message = "" } = info;
    let metadataToPrint = "";
    if (logMeta && Object.keys(logMeta).length > 0) {
      metadataToPrint = `\n${JSON.stringify(logMeta, null, 2)}`;
    }
    return `${info.timestamp} ${info.level} [${info.label}]: ${message}${metadataToPrint}`;
  });

  const logger = createLogger({
    level: process.env.LOG_LEVEL || "debug",
    format: combine(label({ label: labelToUse }), timestamp(), metadata({ fillExcept: ["message", "level", "timestamp", "label"] })),
    transports: [],
  });

  logger.add(
    new transports.Console({
      format: combine(colorize(), logFormat),
    }),
  );

  loggerInstances[labelToUse] = logger;
  return logger;
};
