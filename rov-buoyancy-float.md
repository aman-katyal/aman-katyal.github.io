---
layout: default
title: "Autonomous Buoyancy Float"
permalink: /projects/rov-buoyancy-float
role: "Embedded Firmware & Systems"
description: "Overhaul of an autonomous underwater cylinder's 'brain' using Adafruit Feather RP2040 in C, incorporating LittleFS, PID depth control, and LoRa OTA tuning."
technologies: ["RP2040", "C", "LittleFS", "LoRa RFM9x", "PID Control", "Python"]
image: "/assets/images/buoyancy_preview.jpg"
printable: true
order: 4
---

**Context:** Purdue IEEE ROV Team

Outside of the main ROV, our team utilizes an autonomous buoyancy float designed for vertical profile data collection. The device is a self-contained cylinder that moves up and down through the water column by changing its volume. While the physical hardware—including the linear actuator and syringe-based buoyancy engine—was established in a previous year, I am leading a complete overhaul of the float's "brain" to move from legacy scripting to high-performance firmware.

The primary challenge for this autonomous cylinder is to reach and maintain specific target depths with high accuracy, often while navigating shifting water densities. The float is designed to descend to a programmed depth, dwell to collect a suite of environmental data, and then return to the surface to transmit those data packets to the ground station.

### Firmware Migration and Hardware Optimization

The float was originally running on CircuitPython, which served as a functional starting point but lacked the granular hardware control needed for complex mission profiles. I am migrating the entire codebase to **C** on an **Adafruit Feather RP2040**. This shift allows for deeper optimization of the RP2040’s dual-core architecture and provides low-level control over the peripheral registers, which is essential for maximizing the efficiency of the linear actuator and sensor interfaces.

### Persistent Storage and Over-the-Air Tuning

One of the primary challenges with underwater robotics is that the electronics are inaccessible once the pressure vessel is sealed. To eliminate the need to open the enclosure for software tweaks, I developed a dynamic tuning and storage system:

* **LittleFS Integration:** I implemented the **LittleFS** file system to manage the RP2040’s onboard flash memory. This allows the float to store PID constants as persistent files. Unlike standard memory, these values survive power cycles, ensuring the float maintains its tuned behavior throughout a deployment without requiring a hard-coded reflash.
* **LoRa Remote Tuning:** I integrated an **RFM9x LoRa radio module** to establish a long-range communication link with the ground station. I designed a custom command protocol that allows us to send new PID tuning constants over the radio while the float is in the water. Once a packet is received, the float updates its active control loop and automatically saves the new parameters to flash via LittleFS. This "Over-the-Air" tuning capability allows for rapid iteration of the buoyancy engine’s performance in real-world conditions.

### Mission Execution and Surface Telemetry

During a typical mission, the float must achieve a specific depth setpoint with high precision to ensure data integrity. I developed the logic that handles the transition between data collection at depth and the surfacing phase. Once the float detects it has reached the surface via the pressure sensor, it initiates a transmission sequence, sending the gathered packets of IMU, depth, and temperature data over the LoRa link.

To interface with the float, I built a dedicated ground station using a second Adafruit Feather and LoRa module. This unit acts as a gateway, receiving data packets from the float and piping them to a laptop via serial. I developed a **Python-based front-end** to process this serial stream and provide a real-time UI for the team. The dashboard visualizes live plots of the sensor data, which is the primary tool for validating that the buoyancy engine hit its target depth with the required accuracy.
