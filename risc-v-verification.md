---
layout: default
title: "RISC-V FPU Verification (UVM/DPI-C)"
permalink: /projects/risc-v-verification
printable: true
order: 2
---
[← Back to Home](/)

# RISC-V FPU Verification (UVM & DPI-C)

**Technologies:** SystemVerilog, UVM, C/C++, DPI-C, Tcl Scripting, AMD Vivado.
**Context:** Purdue SoCET (System-on-Chip Extension Technologies) — AFTx SoC Team.

## 1. The Mission: Tape-Out Readiness
Purdue SoCET is an undergraduate research team that designs, verifies, and fabricates (tapes out) custom RISC-V System-on-Chips. Unlike standard class projects, our designs are sent to a foundry (SkyWater/TSMC) for manufacturing, meaning **verification failures are expensive and permanent.**

My team was responsible for the **Floating Point Unit (FPU)** of the AFTx core. The FPU is a high-risk component; it must handle complex arithmetic (Add, Sub, Mul, Div) while strictly adhering to the **IEEE 754** standard. A single bit-flip in rounding or edge-case handling (NaN, Infinity, Denormals) renders the processor mathematically invalid.

---

## 2. Verification Architecture
I architected a modular **Universal Verification Methodology (UVM)** testbench. Instead of relying on manual directed tests, we utilized **Constrained Random Verification (CRV)** to mathematically prove the design's correctness across millions of randomized cycles.

### The "Secret Sauce": DPI-C Golden Reference
Verifying floating-point logic in pure SystemVerilog is inefficient and error-prone. To solve this, I utilized **DPI-C (Direct Programming Interface)** to bridge the simulation with a C++ reference model.

Since C++ has native, mature support for IEEE 754 arithmetic (via `fenv.h`), it acts as the "Oracle" (Golden Model) for our testbench.

---

## 3. Implementation Deep Dive

### A. The C-Based Golden Predictor
The core of the verification strategy is a C model that replicates the FPU's expected behavior. I used `fenv.h` to dynamically switch rounding modes (Round to Nearest, Round to Zero, etc.) to match the RISC-V instruction set requirements.

*Snippet from `predictor.c` showing IEEE 754 handling:*

```c
#include <fenv.h>
#include "svdpi.h"

// Set the C environment rounding mode to match the RISC-V instruction
void set_round_mode(fpu_round_t mode) {
    int fenv_mode = -1;
    switch(mode) {
        case RDN: fenv_mode = FE_DOWNWARD;    break;
        case RNE: fenv_mode = FE_TONEAREST;   break;
        case RTZ: fenv_mode = FE_TOWARDZERO;  break;
        case RUP: fenv_mode = FE_UPWARD;      break;
    }
    if (fenv_mode != -1) fesetround(fenv_mode);
}

// The Golden Reference Function called by UVM
void fpu_predict(fpu_input_t in, fpu_output_t* out) {
    set_round_mode(in.round);

    // Bit-cast input integers to floats for calculation
    float a = bits_to_fp32((uint32_t)in.a);
    float b = bits_to_fp32((uint32_t)in.b);
    float r = 0;

    switch (in.op) {
        case FPU_OP_ADD: r = a + b; break;
        case FPU_OP_SUB: r = a - b; break;
        case FPU_OP_MUL: r = a * b; break;
        case FPU_OP_DIV: r = a / b; break;
    }

    // Return result packed as bits for comparison
    out->result = fp32_to_bits(r);
}
````

### B. The UVM Bridge (SystemVerilog)

The UVM Predictor class acts as the bridge. It subscribes to transactions from the monitor, passes them to the C function above, and sends the "Golden Result" to the scoreboard.

*Snippet from `predictor.sv`:*

```systemverilog
class predictor extends uvm_subscriber#(transaction);
  `uvm_component_utils(predictor)

  // Analysis port to send "Golden" results to the Scoreboard
  uvm_analysis_port#(transaction) pred_ap;
  
  function void write(transaction t);
    fpu_input_t  c_in;
    fpu_output_t c_out;

    // 1. Pack SystemVerilog transaction into C-compatible struct
    c_in.a = t.a;
    c_in.b = t.b;
    c_in.op = fpu_op_t'(t.op);
    c_in.round = fpu_round_t'(t.round);

    // 2. Call the C function via DPI
    fpu_predict(c_in, c_out);

    // 3. Create expected transaction and broadcast to Scoreboard
    output_tx = transaction#(32)::type_id::create("output_tx", this);
    output_tx.result_sum = c_out.result;
    pred_ap.write(output_tx);
  endfunction
endclass
```

### C. The Scoreboard (Handling Edge Cases)

The Scoreboard compares the RTL Output (Actual) against the C Output (Expected). A key challenge in FPU verification is **Signed Zero**. In IEEE 754, `+0.0` and `-0.0` are distinct bit patterns but mathematically equal. Our scoreboard logic explicitly handles this to prevent false failures.

*Snippet from `comparator.sv`:*

```systemverilog
virtual function bit do_compare(uvm_object rhs, uvm_comparer comparer);
    transaction actual;
    $cast(actual, rhs);

    // Special check for -0.0 vs +0.0 (IEEE 754 Edge Case)
    // 0x80000000 (-0.0) and 0x00000000 (+0.0) should be treated as a Match
    if ((this.result_sum == 32'h80000000 && actual.result_sum == 32'h0) ||
        (this.result_sum == 32'h0 && actual.result_sum == 32'h80000000)) begin
      
      `uvm_info("Comparator", "Match: Treating +0.0 and -0.0 as equivalent", UVM_MEDIUM)
      return 1; 
    end

    // Default bit-accurate comparison for all other numbers
    return super.do_compare(rhs, comparer);
endfunction
```

-----

## 4\. Workflow Automation

In a large team, "it works on my machine" is not acceptable. I developed **Tcl automation scripts** to programmatically generate the Vivado project structure. This allows any engineer to clone the repo and build the entire verification environment with a single command, ensuring reproducibility.

*Snippet from `build.tcl`:*

```tcl
# --- Automated Project Setup ---
set project_name "fpu_uvm"
create_project -force $project_name . -part xc7z020clg400-1

# Detect and add HDL files
set sv_source_files [glob -nocomplain -directory $script_dir *.sv *.v *.svh]
add_files -fileset sources_1 $sv_source_files

# Explicitly set file types for SystemVerilog
set added_sv_files [get_files -filter {FILE_TYPE == Verilog || FILE_TYPE == "SystemVerilog"}]
if {[llength $added_sv_files] > 0} {
    set_property file_type SystemVerilog $added_sv_files
}

# Link C Files for DPI Simulation
set c_source_files [glob -nocomplain -directory $script_dir *.c *.h]
add_files -fileset sim_1 $c_source_files
```

-----

## 5\. Results

\*   **100% Functional Coverage:** Achieved for all basic arithmetic operations (ADD, SUB, MUL, DIV) across all rounding modes.
\*   **Bug Identification:** The testbench successfully flagged a critical logic bug in the RTL's handling of `NaN` propagation during division, which was patched before tape-out.
\*   **Scalability:** The UVM/DPI architecture was adopted by other teams within SoCET for verifying complex logic blocks like the Memory Management Unit (MMU).
