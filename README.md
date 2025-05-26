# MCP Server Demo (using Activity API)

An MCP server that wraps around an "Activity API" service that provides blockchain activity and holder information for SBC (Stablecoin).

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file with:

```
API_KEY=your_api_key
```

## Usage

Start the server:

```bash
npm run start
```

The server runs on port 3333 and provides the following MCP tools that maps to 3 of [Activity API](https://github.com/stablecoinxyz/activity-api) endpoints:

- `getChainActivity` - Get blockchain activity information for a specific chain
- `getHolderStatsPerChain` - Get holder counts across different chains
- `getHolderInfo` - Get holder information by wallet address 