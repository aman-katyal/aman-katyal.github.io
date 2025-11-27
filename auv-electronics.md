---
layout: default
title: "Swarm-Style AUV Compute & Power Architecture"
permalink: /projects/auv-electronics
printable: true
order: 1
---
[← Back to Home](/)

# Swarm-Style AUV Compute & Power Architecture

**Technologies:** Altium/KiCad, NVIDIA Jetson Orin Nano, Raspberry Pi CM5, Power Electronics.
**Role:** Electronics Design Lead

## System Architecture
I architected a hierarchical compute system designed to decouple real-time flight control from high-bandwidth AI processing. The system uses a **Pixhawk 4** for low-level stabilization, a **Raspberry Pi CM5** for system management and MAVLink bridging, and an **NVIDIA Jetson Orin Nano** for computer vision and Lidar processing.

## Power Distribution Board (PDB) Design
The core of the electrical stack is a custom PDB managing three 14.8V Li-ion battery packs. I moved away from failure-prone mechanical switches, instead engineering a solid-state magnetic latching circuit.

![PDB Schematic Placeholder](/assets/images/pdb-schematic.png)
*Figure 1: PDB Schematic highlighting the latching logic and current sensing path.*

**Solid-State Master Switch**
I designed a latching logic circuit using a **CD4013BE D-Flip-Flop** triggered by an external magnetic reed switch. The flip-flop drives a gate driver for the main P-Channel MOSFET bank, allowing the vehicle to be powered on/off externally without compromising the waterproof pressure hull.

**Telemetry & Health Monitoring**
To monitor battery health in real-time, I integrated an **INA226** high-side current/power monitor and an **ATmega328P** MCU directly onto the PDB. The MCU aggregates voltage, current, and thermistor data, reporting it to the main computer via I2C to trigger safety shutoffs if thermal or voltage limits are exceeded.

## Custom Carrier Boards
Commercial carrier boards were too bulky for the pressure vessel. I designed compact, application-specific carriers for both compute modules.

**Raspberry Pi CM5 Carrier**
The board integrates robust buck converters to step down the 14.8V battery rail to stable 5V and 3.3V logic levels. I exposed specific UART and Ethernet interfaces to support future acoustic modems for inter-vehicle swarm communication.

**Jetson Orin Nano Carrier**
For the AI engine, I designed a carrier supporting high-speed peripherals. This required strict impedance matching and differential pair routing for USB 3.0 lines (vision cameras) and PCIe lanes (NVMe storage), ensuring signal integrity for high-bandwidth sensor data.

## Thermal Engineering
With no airflow inside the sealed hull, I implemented a conductive cooling strategy. Heat-generating components (CPU/GPU/VRMs) utilize a thermal interface material (TIM) to bridge heat directly to the aluminum chassis, which transfers thermal energy to the outer pressure hull and into the ocean.
