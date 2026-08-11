# Web3 Trackers MCP Server

Crypto marketing attribution tools for MCP clients. Build UTM-tagged tracking URLs, estimate campaign ROI, compare the major web3 attribution platforms, and pull DeFi marketing benchmarks.

**No account, no API key, no rate-limit signup.**

The server is hosted at `https://www.web3trackers.com/api/mcp` and speaks HTTP JSON-RPC (protocol `2025-06-18`). This package is a small stdio wrapper for clients that expect a spawnable command. It has no dependencies.

## Tools

| Tool | What it does |
|---|---|
| `build_tracking_url` | Build a UTM-tagged tracking URL, preserving any query parameters already on the URL |
| `estimate_campaign_roi` | ROI, ROAS and cost per on-chain conversion from spend, value and conversion count |
| `compare_attribution_tools` | Compare 9 web3 attribution tools on pricing, setup, chain support and best fit |
| `get_web3_marketing_benchmarks` | Cost per wallet by chain, funnel conversion rates, campaign benchmarks and attribution windows |

`compare_attribution_tools` reports competitors honestly, including the cases where another tool is the better choice.

## Install

### Claude Code

```bash
claude mcp add web3trackers -- npx -y github:aerobean/web3trackers-mcp
```

### Claude Desktop / any client using `mcpServers` config

```json
{
  "mcpServers": {
    "web3trackers": {
      "command": "npx",
      "args": ["-y", "github:aerobean/web3trackers-mcp"]
    }
  }
}
```

### Direct HTTP

If your client supports streamable HTTP or plain JSON-RPC over POST, skip this package and point it at the endpoint:

```
https://www.web3trackers.com/api/mcp
```

## Verify it works

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npx -y github:aerobean/web3trackers-mcp
```

You should get a JSON-RPC response listing four tools.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `WEB3TRACKERS_MCP_ENDPOINT` | `https://www.web3trackers.com/api/mcp` | Point the wrapper at a different deployment |

## Privacy

The wrapper forwards each JSON-RPC message to the hosted endpoint and returns the reply. It stores nothing locally and adds no telemetry. Tool calls are stateless — no session, no account, no wallet connection.

## Requirements

Node.js 18 or newer (uses the built-in `fetch`).

## License

MIT
