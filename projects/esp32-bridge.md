---
layout: page
title: ESP32 Game Controller Bridge
permalink: /projects/esp32-bridge/
---

# ESP32 Universal Game Controller Bridge

**Technologies:** ESP32-S3, ESP-IDF (C++), Bluetooth Classic/BLE, USB HID, FreeRTOS.
**Context:** Personal Project (May 2025 – Aug 2025)

## The Problem
Modern game controllers (Xbox, PlayStation) use proprietary Bluetooth protocols that are often incompatible with consoles like the Nintendo Switch without expensive dongles. I wanted to create a cost-effective, open-source bridge that allows *any* third-party controller to work seamlessly on the Switch with negligible latency.

## The Solution
I developed a hardware bridge on the **ESP32-S3** using the ESP-IDF framework. The device acts as a "man-in-the-middle," intercepting Bluetooth packets from controllers and translating them into Nintendo Switch-compatible USB HID reports in real-time.

### Key Engineering Contributions

1.  **Dual-Stack Architecture:**
    *   Engineered the system to handle two concurrent wireless stacks: maintaining a stable Bluetooth connection with the controller while simultaneously acting as a USB HID device for the console.
    *   Implemented a translation layer to map input reports from various standards (XInput, DirectInput) to the Switch Pro Controller protocol.

2.  **Latency Optimization:**
    *   Optimized the FreeRTOS task scheduling to achieve a **verified sub-30ms latency**, ensuring the bridge was viable for competitive gaming.
    *   Utilized DMA (Direct Memory Access) where possible to offload data transfer tasks from the CPU.

3.  **Memory Management & Debugging:**
    *   Systematically debugged critical **heap fragmentation issues** that occurred during long sessions.
    *   Used heap tracing tools to identify memory leaks in the packet parsing logic, ensuring stable performance during extended gaming sessions.

## Results
*   Achieved a stable, low-latency connection comparable to native wired controllers.
*   Successfully reverse-engineered portions of the Switch Bluetooth handshake to ensure compatibility.

[Link to GitHub Repo]
