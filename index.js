#!/usr/bin/env node
'use strict';

/**
 * Web3 Trackers MCP server — stdio transport.
 *
 * The server itself is hosted at https://www.web3trackers.com/api/mcp and speaks
 * HTTP JSON-RPC. This wrapper exists because most MCP clients and directories
 * expect a stdio command they can spawn. It reads newline-delimited JSON-RPC
 * messages on stdin, forwards each one over HTTPS, and writes the reply to
 * stdout. It holds no state and stores nothing.
 */

const ENDPOINT = process.env.WEB3TRACKERS_MCP_ENDPOINT || 'https://www.web3trackers.com/api/mcp';
const REQUEST_TIMEOUT_MS = 30000;

/** Write one JSON-RPC message to stdout, newline-delimited. */
function send(message) {
  process.stdout.write(JSON.stringify(message) + '\n');
}

function errorResponse(id, code, message) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

async function forward(message) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(message),
      signal: controller.signal,
    });

    // Notifications are answered with 202 and an empty body; they take no reply.
    if (response.status === 202) return null;

    if (!response.ok) {
      return errorResponse(message.id, -32603, `Upstream returned HTTP ${response.status}`);
    }

    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch (err) {
    const reason = err.name === 'AbortError' ? 'Upstream request timed out' : err.message;
    return errorResponse(message.id, -32603, reason);
  } finally {
    clearTimeout(timer);
  }
}

let buffer = '';
let pending = 0;
let stdinEnded = false;

/** Exit only once every forwarded message has been answered. */
function exitIfDone() {
  if (stdinEnded && pending === 0) process.exit(0);
}

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
  buffer += chunk;

  let newline;
  while ((newline = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (!line) continue;

    let message;
    try {
      message = JSON.parse(line);
    } catch {
      send(errorResponse(null, -32700, 'Parse error'));
      continue;
    }

    // Messages are forwarded as they arrive; replies carry their own id, so a
    // client that pipelines requests still matches them up correctly.
    pending += 1;
    forward(message).then((reply) => {
      if (reply !== null) send(reply);
      pending -= 1;
      exitIfDone();
    });
  }
});

process.stdin.on('end', () => {
  stdinEnded = true;
  exitIfDone();
});
