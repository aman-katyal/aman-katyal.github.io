---
layout: default
title: "ESP32 Game Controller Bridge"
permalink: /projects/esp32-bridge
---
[← Back to Home](/)
# ESP32 Universal Game Controller Bridge

**Technologies:** ESP32-S3, ESP-IDF, C++, Bluetooth, USB HID.
**Context:** Personal Project

## The Problem
Third-party Bluetooth controllers are often incompatible with consoles like the Nintendo Switch due to proprietary handshake protocols.

## The Solution
I developed a hardware bridge that intercepts Bluetooth packets and translates them into Switch-compatible USB HID reports in real-time.

### Key Contributions
*   **Low Latency Architecture:** Optimized the dual-stack Bluetooth/USB architecture to achieve verified sub-30ms latency.
*   **Memory Debugging:** Systematically debugged critical heap fragmentation issues and memory leaks using heap tracing tools to ensure stability during extended gaming.
*   **Reverse Engineering:** Engineered a mechanism to translate packet data into valid USB HID reports, mimicking official hardware.

[Link to GitHub]
