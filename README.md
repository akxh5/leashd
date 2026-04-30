# leashd 🛡️

The ultimate autonomous-agent security layer for your Solana vault.

**leashd** transforms a standard PDA into a secure, policy-enforced vault. It allows autonomous agents to manage your funds within strict, on-chain constraints—preventing rogue behavior and drain attacks.

---

## 🏗️ Architecture

- **Policy Engine (Anchor Program)**: A secure vault (PDA) that holds SOL and SPL tokens. It enforces limits, allowlists, and cooldowns at the smart contract level.
- **Frontend (React)**: A modern dashboard for owners to deploy vaults, update policies, and monitor agent activity.
- **Agent Layer**: Simulated autonomous script that attempts transactions, governed by the on-chain security layer.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Solana CLI](https://docs.solanalabs.com/cli/install)
- [Anchor CLI](https://www.anchor-lang.com/docs/installation)
- Node.js & Yarn/NPM

### 2. Program Setup
```bash
# Install dependencies
cargo update

# Build the program
anchor build

# Deploy (ensure you have SOL on devnet)
anchor deploy
```

### 3. Frontend Setup
```bash
cd app
yarn install
yarn dev
```

---

## 🛡️ Policy Features

- **Transaction Limits**: Set the maximum SOL/Tokens allowed per single transaction.
- **Daily Thresholds**: Rolling 24-hour spending limits.
- **Allowlist Enforcement**: Only approved recipient addresses can receive funds.
- **Cooldown Periods**: Minimum time required between consecutive agent transactions.
- **Emergency Kill Switch**: Owner-only override to freeze all agent activity instantly.

---

## 🤖 Demo: Agent Simulation

We provide a simulation script to demonstrate the security layer in action.

### Run Simulation
```bash
# Requires ts-node installed
npx ts-node agent-sim.ts
```

### What happens?
1. **Valid Transfer**: The agent attempts a 0.01 SOL transfer to an allowlisted address. **(SUCCESS)**
2. **Invalid Transfer**: The agent attempts to send 0.2 SOL, exceeding the default 0.1 SOL limit. **(FAIL - Blocked On-Chain)**

---

## 🧪 Testing

```bash
# Run Anchor test suite
anchor test
```

Current coverage includes:
- Vault initialization
- Within-limit transfer execution
- Limit enforcement (failure cases)
- Agent authorization checks

---

## ⚠️ Limitations

- **Coarse Token Limits**: Currently, SPL tokens share the same numerical limits as SOL for demonstration purposes.
- **Single Agent**: Supports one active agent address per vault.
- **Window Reset**: Daily limit resets based on a simple rolling window start.
