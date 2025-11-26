---
layout: page
title: RISC-V FPU Verification
permalink: /projects/riscv-verification/
---

# UVM Verification for AFT x09 RISC-V SoC

**Technologies:** UVM, SystemVerilog, C++, DPI-C, AMD Vivado, Tcl Scripting.
**Context:** Purdue SoCET (Aug 2025 – Present)

## The Problem
Floating Point Units (FPUs) are notoriously difficult to verify due to the massive state space and corner cases involving IEEE 754 standards (e.g., NaNs, denormals, rounding modes). A simple directed test approach is insufficient for a complex RISC-V SoC.

## The Solution
I architected a modular, class-based **Universal Verification Methodology (UVM)** testbench to verify the FPU, utilizing a "compare-against-reference" strategy.

### Key Engineering Contributions

1.  **UVM Testbench Architecture:**
    *   Built the full UVM hierarchy: Agents, Drivers, Monitors, and Scoreboards.
    *   [Insert snippet of UVM code or diagram here if possible].

2.  **DPI-C Reference Model:**
    *   Integrated a C-based floating-point reference model via **DPI-C**.
    *   Used this as a self-checking predictor, utilizing TLM analysis ports for cycle-accurate comparison between the Design Under Test (DUT) and the reference model.

3.  **Constrained Random Verification (CRV):**
    *   Executed a verification plan targeting edge cases like denormalized numbers and specific rounding modes.
    *   Closed functional coverage holes using randomized constraints in AMD Vivado.

4.  **Automation:**
    *   Developed Tcl scripts to generate project structures and configure simulations, creating a "push-button" reproducible workflow.

## Results
*   Established a robust verification environment for the AFT x09 SoC.
*   Verified compliance with IEEE 754 standards.

[Link to GitHub Repo]
