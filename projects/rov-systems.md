---
layout: page
title: ROV Control Systems
permalink: /projects/rov-systems/
---

# Unified ROV Control & Verification Architecture

**Technologies:** RP2350, STM32, I2C/SPI, UART, Differential Pair Routing, KiCad.
**Context:** Purdue IEEE ROV Team (Aug 2024 – Present)

## The Problem
In competitive ROV design, software development often bottlenecks because firmware teams have to wait for hardware manufacturing. Additionally, signal integrity is a major challenge in underwater environments due to EMI and long cable runs.

## The Solution
I pioneered the design of a unified test bench and modular PCBs that decouple firmware verification from the electrical manufacturing schedule, allowing for parallel development.

### Key Engineering Contributions

*   **Unified Test Bench (RP2350 & STM32):**
    *   Designed a full-stack board that simulates vehicle inputs/outputs.
    *   This accelerated the software development lifecycle by allowing firmware engineers to validate code before the actual vehicle hardware was fabricated.

*   **Sensor Aggregation PCB:**
    *   Consolidated IMU, depth, and pressure data over I2C/SPI.
    *   Included an **automated power multiplexer** and dedicated UART interface for real-time console debugging.

*   **Signal Integrity Optimization:**
    *   Designed a compact ESC-to-thruster adapter board.
    *   Utilized **differential pair routing** to minimize EMI, ensuring stable navigation data even in electrically noisy underwater environments.

## Results
*   Streamlined the firmware workflow for the MATE ROV competition.
*   Centralized control of solenoids, PWM servos, and motor drivers onto a single modular PCB.

[Link to GitHub Repo] | [Link to Team Website]
