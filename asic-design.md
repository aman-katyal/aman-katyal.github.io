---
layout: default
title: "ASIC & Digital Design Portfolio"
permalink: /projects/asic-design
printable: true
---

# ASIC & Digital Design Portfolio

This portfolio details my experience in the full digital design cycle, from architectural planning and RTL implementation to physical design and timing closure.

---

## 1. APB UART SoC Peripheral
**Protocol:** Advanced Peripheral Bus (APB)
**Key Technologies:** SystemVerilog, APB Protocol, UART.

I designed a UART receiver integrated into an SoC via the APB protocol. This project involved extending a basic UART design to handle complex bus transactions while supporting low-speed peripherals where latency is not a primary concern.

### Technical Highlights
* **Configurable Parameters:** Supports flexible data sizes (5, 7, or 8 bits) and bit periods (10 to 16383 clock cycles).
* **Bus Interface:** Implemented a standard APB subordinate interface with address mapping for status, error, and data registers.
* **Clocking:** Validated for a 50MHz system clock.
* **Error Handling:** Integrated transaction error feedback (psaterr) for invalid access attempts or write-to-read-only violations.

**[Space for APB Subordinate & UART RX RTL Diagram]**

---

## 2. AHB-Lite FIR Filter Hardware Accelerator
**Protocol:** Advanced High-Performance Bus (AHB-Lite)
**Key Technologies:** Pipelining, DSP, RAW Hazard Mitigation.

I developed a high-performance 4-tap Finite Impulse Response (FIR) filter accelerator. This design utilizes the pipelined nature of the AHB bus to allow address phases to overlap with data phases, significantly increasing throughput.

### Technical Highlights
* **Hazard Mitigation:** Implemented logic to detect and resolve Read-after-Write (RAW) hazards by forwarding data directly from the write bus when a register is accessed immediately after a write.
* **State Machine Design:** Engineered a Coefficient Loader state machine to manage the sequential loading of four 16-bit fixed-point coefficients into the datapath.
* **Pipelined Architecture:** Supported nonsequential transfers with registered read data (hrdata) to maximize propagation time and minimize critical path issues.
* **Fixed-Point Math:** Utilized a 17-bit datapath for absolute precision during convolution operations.

**[Space for AHB Subordinate & FIR Accelerator RTL Diagram]**
**[Space for Coefficient Loader State Transition Diagram]**

---

## 3. USB 1.1 Full-Speed SoC Peripheral
**Protocol:** AHB-Lite, USB 1.1
**Key Technologies:** NRZI Encoding, Clock Domain Crossing (CDC), 64B FIFO.

This project involved designing an AHB-based SoC peripheral supporting USB 1.1 Full-Speed Bulk Transfers. The system manages the complexities of serial data transmission at 12MHz within a 100MHz SoC environment.

### Technical Highlights
* **Transceiver Logic:** Designed custom USB RX and TX modules to handle PID encoding, sync bytes, and EOP sequences.
* **Physical Layer Encoding:** Implemented Non-Return-to-Zero-Inverted (NRZI) encoding and decoding to ensure reliable data sampling.
* **Buffer Management:** Integrated a 64-byte dual-port FIFO buffer to decouple bus transactions from the serial bitstream.
* **Protocol Support:** Engineered hardware to handle OUT, IN, DATA0/1, and handshake (ACK/NAK/STALL) packets.
* **Bonus Features:** Support for Bit-Stuffing and Cyclic Redundancy Check (CRC) signatures (x16 + x15 + x2 + 1) for data integrity.

**[Space for USB SoC Module Top-Level Architecture Diagram]**
**[Space for USB RX and TX FSM RTL Diagrams]**

---

## 4. ASIC Physical Design & Timing Closure
**Tools:** Synopsys Design Compiler, Cadence Innovus.
**Key Metrics:** 400MHz Timing Closure, Post-Route Analysis.

I guided a complex digital design through the complete IC layout flow, moving from high-level RTL to a fabrication-ready representation.

### Technical Highlights
* **Synthesis:** Utilized Design Compiler to map SystemVerilog source code to standard cell libraries.
* **Physical Implementation:** Performed floorplanning, placement, and routing (P&R) using Cadence Innovus.
* **I/O Pad Integration:** Manually configured the pad-frame ring to optimize signal integrity and driver strength.
* **Static Timing Analysis (STA):** Debugged critical path violations post-routing and performed area tuning to reduce negative slack.
* **Metal Fill & Density:** Added dummy metal layers to ensure uniform density and wafer planarity during manufacturing.