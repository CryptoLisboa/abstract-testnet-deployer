# Abstract Chain Smart Contract Deployment

This project demonstrates how to deploy and verify smart contracts on Abstract Chain's testnet using Hardhat and zkSync.

## Prerequisites

### IDE Installation

Choose one of the following IDEs:

#### Option 1: Cursor (Recommended)
1. Visit [Cursor's website](https://cursor.sh/)
2. Download the appropriate version for your OS:
   - macOS (Apple Silicon or Intel)
   - Windows
   - Linux
3. Install and launch Cursor
4. Optional: Sign in with GitHub for additional features

#### Option 2: Visual Studio Code
1. Visit [VS Code's website](https://code.visualstudio.com/)
2. Download the stable build for your OS:
   - macOS (Universal or Intel)
   - Windows (System Installer or User Installer)
   - Linux (.deb, .rpm, or .tar.gz)
3. Install and launch VS Code
4. Recommended extensions for Solidity development:
   - Solidity by Nomic Foundation
   - Hardhat for VS Code
   - Error Lens

### Node.js Installation

1. Open your terminal in your chosen IDE:
   - **Cursor**: `View > Terminal` or `Cmd/Ctrl + J`
   - **VS Code**: `View > Terminal` or `` Ctrl + ` ``

2. Install Node.js:
   ```bash
   # For macOS (using Homebrew)
   brew install node

   # For Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # For Windows
   # Download and install from https://nodejs.org/
   ```

3. Verify installation:
   ```bash
   node --version # Should be ≥ 18.0.0
   ```

### Project Setup

1. Install pnpm globally:
   ```bash
   npm install -g pnpm   # Should be ≥ 8.0.0
   ```

2. Install project dependencies:
   ```bash
   pnpm install
   ```

## Configuration

1. Create your environment file:
   ```bash
   cp .env.sample .env
   ```

2. Edit `.env` file:
   - Replace `YOUR_PRIVATE_KEY` with your wallet's private key (without 0x prefix)
   - Set `CONTRACT_COUNT` to specify how many contracts you want to deploy (default: 5)

   Example `.env`:
   ```env
   PRIVATE_KEY=abcdef1234567890...  # Your private key without 0x prefix
   CONTRACT_COUNT=5                  # Number of contracts to deploy
   ```

## Available Scripts

You can run the following commands with pnpm:

```bash
# Development
pnpm run compile        # Compile all contracts
pnpm run deploy         # Deploy to Abstract testnet
pnpm run deploy:dry     # Dry run deployment (no actual deployment)
pnpm run verify         # Verify contracts on explorer

# Code Quality
pnpm run format         # Format all files
pnpm run lint          # Check code style
pnpm run lint:fix      # Fix code style issues

# Testing
pnpm run test          # Run all tests

# Maintenance
pnpm run clean         # Clean Hardhat cache
```

## Deployment

1. Compile the contracts:
   ```bash
   pnpm run compile
   ```

2. Deploy to Abstract Chain testnet:
   ```bash
   pnpm run deploy
   ```

The deployment script will:
- Deploy the specified number of contracts sequentially
- Save deployment information in the `deployments` directory
- Automatically verify contracts on the Abstract Chain explorer
- Display a summary of all deployments and verifications

## Deployment Information

- Each contract will have a unique deployment index and timestamp
- Deployment information is saved in:
  - `deployments/abstractTestnet-deployment.json` (latest deployment)
  - `deployments/abstractTestnet/deployment-[timestamp].json` (historical deployments)

## Security

- Never commit your `.env` file
- Keep your private key secure and never share it
- Use a dedicated testnet wallet for deployments

## Troubleshooting

If you encounter issues:
1. Ensure you have sufficient testnet ETH
2. Check that your private key is correct
3. Verify network connectivity
4. Make sure all dependencies are installed
5. Try cleaning the cache:
   ```bash
   pnpm run clean
   ```

## Support

If you need help, ping me on Twitter [@CryptoLisboa](https://twitter.com/CryptoLisboa) or Discord @CryptoLisboa
