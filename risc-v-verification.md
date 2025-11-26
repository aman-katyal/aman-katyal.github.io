---
layout: page
title: "RISC-V FPU Verification"
permalink: /projects/risc-v-verification
---

# UVM Verification for AFT x09 RISC-V SoC

**Technologies:** UVM, SystemVerilog, DPI-C, Tcl, AMD Vivado.
**Context:** Purdue SoCET

## The Problem
Verifying a Floating-Point Unit (FPU) involves massive corner cases (IEEE 754 standards, rounding modes) that standard directed testing cannot cover effectively.

## The Solution
I architected a modular, class-based UVM testbench (Agent, Driver, Monitor, Scoreboard) to automate the verification process.

### Key Contributions
*   **DPI-C Integration:** Integrated a C-based floating-point reference model as a "Golden Predictor" for cycle-accurate, real-time comparison against the RTL.
*   **Coverage Closure:** Executed a plan targeting denormals and rounding modes, closing functional coverage holes using Constrained Random Verification (CRV).
*   **Automation:** Wrote Tcl scripts to programmatically generate project structures, establishing a "push-button" reproducible workflow for the team.

[Link to GitHub]
