---
layout: page
title: ML Gesture Dueling System
permalink: /projects/ml-dueling-system/
---

# Microcontroller Dueling System with ML-Enabled Gesture Input

**Technologies:** RP2350 (Dual Core), TensorFlow Lite, C++, PCB Design, IR Protocols.
**Context:** Personal/Course Project (May 2025 – Aug 2025)

## The Problem
Recognizing complex gestures on embedded hardware usually results in high latency, which ruins the experience for real-time gaming. I wanted to build a "magic wand" dueling system that was fast, accurate, and ran entirely on the edge without cloud processing.

## The Solution
I engineered a full-stack embedded system utilizing the **RP2350’s dual-core architecture** to parallelize inference and game logic.

### Key Engineering Contributions

1.  **Dual-Core Architecture:**
    *   **Core 0:** Dedicated to high-frequency IMU polling and **TensorFlow Lite inference**. Achieved <5ms latency with 96% accuracy.
    *   **Core 1:** Handled peripheral I/O, game logic, and LED matrix updates.

2.  **Custom IR Communication Protocol:**
    *   Implemented a Line-of-Sight IR protocol using PWM encoding.
    *   Used GPIO interrupts for non-blocking signal reception and a packet redundancy scheme to ensure valid "hits" were registered on the wearable receiver.

3.  **Hardware Design:**
    *   Designed and fabricated a custom PCB integrating an I2C haptic driver and PIO-driven RGB LED matrix.
    *   Housed electronics in a custom 3D-printed ergonomic enclosure.

## Results
*   Created a fully functional hardware prototype with verifiable sub-5ms latency.
*   [Insert video link or GIF of the wand working].

[Link to GitHub Repo]
