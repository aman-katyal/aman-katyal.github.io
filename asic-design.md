---
layout: default
title: "ASIC & Digital Design Portfolio"
permalink: /projects/asic-design
printable: true
order: 3
---

# Digital Design & ASIC Workflow (ECE 337)

| Category | ASIC Physical Design & RTL |
| :--- | :--- |
| **Tools** | Synopsys Design Compiler, Cadence Innovus, Siemens QuestaSim |
| **Protocols** | AHB-Lite, APB, USB 1.1, UART |
| **Key Metric** | Achieved Timing Closure at 400MHz |

## 1. ASIC Physical Design Flow & Timing Closure
[cite_start]I guided a digital design through the complete physical implementation flow, from synthesis to post-route analysis[cite: 36].
* [cite_start]**Synthesis & Layout:** Utilized Synopsys Design Compiler for logic synthesis and Cadence Innovus for Placement, CTS, and Routing[cite: 36].
* [cite_start]**STA:** Performed Static Timing Analysis with custom SDC constraints to identify and resolve violations[cite: 37].
* [cite_start]**Optimization:** Manually optimized I/O pad frame placement to reduce routing congestion and eliminate negative slack[cite: 37].

## 2. USB 1.1 Full-Speed SoC Peripheral
[cite_start]Designed a complete USB 1.1 transceiver including NRZI encoding and bit-stuffing logic[cite: 21, 24].
* [cite_start]**CDC Management:** Developed an AHB-Lite Subordinate Interface with a 64-byte FIFO to manage Clock Domain Crossing between 12MHz and 100MHz domains[cite: 25].
* [cite_start]**Verification:** Validated protocol compliance for Token, Data, and Handshake packets in QuestaSim[cite: 26].

## 3. AHB-Lite FIR Filter Accelerator
[cite_start]Developed a high-performance DSP accelerator for real-time signal processing[cite: 27, 28].
* [cite_start]**Architecture:** Created comprehensive FSM diagrams for a 4-tap programmable filter[cite: 28].
* [cite_start]**Bus Logic:** Implemented a memory-mapped interface handling pipeline stalling and Read-After-Write hazards[cite: 29].

## 4. APB UART Peripheral
[cite_start]Engineered a configurable UART IP supporting variable baud rates and payload sizes[cite: 31, 32].
* [cite_start]**Interface:** Implemented a register interface compliant with AMBA APB for host configuration[cite: 33].
* [cite_start]**Testing:** Validated transactions using constrained-random test vectors[cite: 34].