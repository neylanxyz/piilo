#!/usr/bin/env bash
set -euo pipefail

# Build examples (includes per-example circuit copy for standalone hosting)
(cd examples/confidential-wallet && npm run build)
(cd examples/confidential-payroll && npm run build)

# Build frontend (copies circuits to frontend/dist/circuits/ via buildStart hook)
(cd frontend && npm run build)

# Merge examples into frontend dist so they're served under the same origin
mkdir -p frontend/dist/examples/confidential-wallet
mkdir -p frontend/dist/examples/confidential-payroll
cp -r examples/confidential-wallet/dist/. frontend/dist/examples/confidential-wallet/
cp -r examples/confidential-payroll/dist/.  frontend/dist/examples/confidential-payroll/
