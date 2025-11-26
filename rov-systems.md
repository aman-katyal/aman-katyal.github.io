---
layout: page
title: "ROV Control Systems"
permalink: /projects/rov-systems
---

# Unified ROV Control & Verification Architecture

**Technologies:** RP2350, STM32, I2C/SPI, UART, Differential Pairs.
**Context:** Purdue IEEE ROV Team

## The Problem
Firmware development was bottlenecked by hardware manufacturing schedules, and signal integrity was compromising underwater navigation accuracy.

## The Solution
I pioneered a "Hardware-in-the-Loop" style test bench and modularized the vehicle's PCB stack to accelerate the development lifecycle.

### Key Contributions
*   **Unified Test Bench:** Designed a full-stack board using RP2350 and STM32 to simulate vehicle physics, decoupling firmware verification from electrical manufacturing.
*   **Sensor Aggregation:** Engineered a custom PCB consolidating IMU, depth, and pressure data with an automated power multiplexer for fail-safe operation.
*   **Signal Integrity:** Utilized differential pair routing on the ESC-to-thruster adapter to minimize EMI and maximize signal reliability in electrically noisy environments.

[Link to GitHub]
