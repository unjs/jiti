function getTopOfStackTrace() {
  const dummyObj = {};
  const oldStackTraceLimit = Error.stackTraceLimit;
  const oldPrepareStackTrace = Error.prepareStackTrace;
  let stack;
  try {
    Error.stackTraceLimit = 1;
    Error.prepareStackTrace = (_, callsites) => callsites;
    Error.captureStackTrace(dummyObj, getTopOfStackTrace);
    // Access .stack inside the try block so V8 invokes our prepareStackTrace
    // before we restore the originals in finally.
    stack = dummyObj.stack;
  } finally {
    Error.prepareStackTrace = oldPrepareStackTrace;
    Error.stackTraceLimit = oldStackTraceLimit;
  }
  return stack.at(-1);
}

module.exports = {
  getStackTrace: getTopOfStackTrace,
};
