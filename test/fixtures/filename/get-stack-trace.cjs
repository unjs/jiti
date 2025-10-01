function getTopOfStackTrace() {
  const dummyObj = {};
  const oldStackTraceLimit = Error.stackTraceLimit;
  Error.stackTraceLimit = 1;
  const oldPrepareStackTrace = Error.prepareStackTrace;
  Error.prepareStackTrace = (_, stack) => stack;
  Error.captureStackTrace(dummyObj, getTopOfStackTrace);
  const stack = dummyObj.stack;
  Error.prepareStackTrace = oldPrepareStackTrace;
  Error.stackTraceLimit = oldStackTraceLimit;
  return stack.at(-1);
}

module.exports = {
  getStackTrace: getTopOfStackTrace,
};
