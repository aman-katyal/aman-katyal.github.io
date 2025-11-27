---
layout: default
title: "RISC-V FPU Verification (UVM/DPI-C)"
permalink: /projects/risc-v-verification
printable: true
order: 2
---
[← Back to Home](/)

# RISC-V FPU Verification (UVM & DPI-C)

**Technologies:** SystemVerilog, UVM, DPI-C, C/C++, Tcl Scripting, AMD Vivado.
**Context:** Purdue SoCET (System-on-Chip Extension Technologies) — AFTx SoC Team.

## The Mission: Tape-Out Readiness
Purdue SoCET is an undergraduate research team that designs, verifies, and fabricates (tapes out) custom RISC-V SoCs. My team was responsible for the **Floating Point Unit (FPU)** of the AFTx core.

The FPU is a high-risk component; it must handle complex arithmetic (Add, Sub, Mul, Div) while strictly adhering to the **IEEE 754** standard. A single bit-flip in rounding or edge-case handling (NaN, Infinity, Denormals) renders the processor mathematically invalid.

## Verification Architecture
I architected a modular **Universal Verification Methodology (UVM)** testbench. Unlike simple directed testing, this environment uses **Constrained Random Verification (CRV)** to mathematically prove the design's correctness across millions of cycles.

### The UVM Topology
*   **Sequencer:** Generates abstract randomized payloads (e.g., "Multiply two denormalized numbers").
*   **Driver:** Converts abstract transactions into pin-level signal toggles, driving the DUT (Design Under Test) interface.
*   **Monitor:** Passively snoops the bus, capturing inputs and outputs to reconstruct the transaction.
*   **Scoreboard:** The "Judge." It takes the input from the Monitor, sends it to the **Golden Model**, and compares the Golden result against the DUT result.

## The "Secret Sauce": DPI-C Golden Reference
Verifying floating-point logic in SystemVerilog is inefficient and error-prone. To solve this, I utilized **DPI-C (Direct Programming Interface)** to bridge the simulation with a C++ reference model.

Since C++ has native, mature support for IEEE 754 arithmetic, it acts as the "Oracle."

### Implementation Details
1.  **The Bridge:** The SystemVerilog testbench calls a C function `compute_expected_fpu()` via DPI.
2.  **The Predictor:** The C model executes the math operation instantly (0 simulation time) and returns the bit-exact expected result.
3.  **The Check:** The Scoreboard compares the C++ result (Expected) vs. the RTL result (Actual).

### Code Snippet: DPI-C Integration
*Below is the SystemVerilog interface importing the C reference function:*

```systemverilog
// Inside the UVM Scoreboard or Predictor Class
import "DPI-C" context function int c_ref_model(
    input int operand_a,
    input int operand_b,
    input int operation_code,
    input int rounding_mode
);

function void check_result(transaction_item tr);
    int expected_result;
    
    // Call the C++ Golden Model
    expected_result = c_ref_model(tr.a, tr.b, tr.op, tr.rm);
    
    // Compare against RTL
    if (expected_result !== tr.result) begin
        `uvm_error("MISMATCH", $sformatf("Exp: %h, Act: %h", expected_result, tr.result))
    end else begin
        `uvm_info("PASS", "Match", UVM_HIGH)
    end
endfunction
```

## Coverage & Corner Cases
We didn't just test "happy paths." The verification plan specifically targeted **IEEE 754 Corner Cases** that break standard logic:
*   **Denormals:** Numbers too small to be represented in standard normalized form.
*   **Rounding Modes:** Verified RNE (Round to Nearest, Even), RTZ (Round to Zero), and RUP/RDN (Round Up/Down).
*   **Special Values:** Massive randomized injection of NaNs (Not a Number) and Infinities to ensure the FPU flags them correctly without locking up.

## Automation & Reproducibility
In a large team, "it works on my machine" is not acceptable. I developed **Tcl scripts** to automate the Vivado simulation environment. This allowed any team member to clone the repo and generate the entire project structure, compile the UVM packages, and run the regression suite with a single command.

```tcl
# Example Tcl Automation Logic
create_project -force fpu_verification ./build -part xc7a100tcsg324-1
add_files -scan_for_includes ./src/rtl
add_files -scan_for_includes ./src/uvm_tb
set_property top top_tb [get_filesets sim_1]
launch_simulation
```

## Outcome
The testbench successfully identified and helped patch critical logic bugs in the Rounding Unit and Exception Flag handling. The FPU block was signed off with 100% functional coverage for the targeted instruction set.
```
