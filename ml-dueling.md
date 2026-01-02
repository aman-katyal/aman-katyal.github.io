---
layout: default
title: "ML Gesture Dueling System"
permalink: /projects/ml-dueling
printable: true
order: 4
---

# Microcontroller Dueling System with ML Input

**Technologies:** RP2350 (Dual Core), TensorFlow Lite, C++, PCB Design.
**Context:** Course Project

## The Problem
Real-time gesture recognition on embedded devices often suffers from latency, making it unusable for fast-paced gaming applications.

## The Solution
I engineered a full-stack system leveraging the RP2350’s dual-core architecture to parallelize AI inference and game logic.

### Key Contributions
*   **Dual-Core Optimization:** Designated Core 0 for high-frequency IMU polling and TensorFlow Lite inference (<5ms latency, 96% accuracy), offloading I/O to Core 1.
*   **Custom Protocol:** Implemented a Line-of-Sight IR protocol using PWM encoding and GPIO interrupts for non-blocking signal reception.
*   **Hardware Prototyping:** Designed a custom PCB with an I2C haptic driver and RGB matrix, housed in a 3D-printed ergonomic enclosure.

[Link to GitHub]
