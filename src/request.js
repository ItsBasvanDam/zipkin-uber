const HttpHeaders = require('./httpHeaders');

function appendZipkinHeaders(req, traceId) {
  const headers = req.headers || {};
  headers[HttpHeaders.TraceId] = traceId.traceId;
  headers[HttpHeaders.SpanId] = traceId.spanId;

  traceId.parentSpanId.ifPresent((psid) => {
    headers[HttpHeaders.ParentSpanId] = psid;
  });
  traceId.sampled.ifPresent((sampled) => {
    headers[HttpHeaders.Sampled] = sampled ? '1' : '0';
  });

  if (traceId.isDebug()) {
    headers[HttpHeaders.Flags] = '1';
  }

  return headers;
}

function appendUberHeaders(req, traceId) {
  const headers = req.headers || {};
  const tId = traceId.traceId;
  const sId = traceId.spanId;
  let psId = 0;
  traceId.parentSpanId.ifPresent((psid) => {
    psId = psid;
  });

  let flags = '';
  flags = traceId.isDebug() ? '1' : '0';
  traceId.sampled.ifPresent((sampled) => {
    flags += sampled ? '1' : '0';
  });
  if (flags.length === 1) {
    flags += '0';
  }

  // see: https://www.jaegertracing.io/docs/1.15/client-libraries/#trace-span-identity
  const uberHeader = `${tId}:${sId}:${psId}:${flags}`;
  headers['uber-trace-id'] = uberHeader;
  return headers;
}

function addZipkinHeaders(req, traceId) {
  const headers = appendZipkinHeaders(req, traceId);
  return Object.assign({}, req, {headers});
}

function addUberHeaders(req, traceId) {
  const headers = appendUberHeaders(req, traceId);
  return Object.assign({}, req, {headers});
}

module.exports = {
  addZipkinHeaders,
  addUberHeaders
};
