---
layout: default
title: "Swarm-Style AUV Compute & Power Architecture"
permalink: /projects/auv-electronics
printable: true
order: 1
---
[← Back to Home](/)

# Swarm-Style AUV Compute & Power Architecture

**Technologies:** KiCad (Schematic Capture), NVIDIA Jetson Orin Nano, Raspberry Pi CM5, Power Electronics.
**Role:** Electronics Design Lead

## System Architecture
I architected a hierarchical compute system designed to decouple real-time flight control from high-bandwidth AI processing. The system uses a **Pixhawk 4** for low-level stabilization, a **Raspberry Pi CM5** for system management and MAVLink bridging, and an **NVIDIA Jetson Orin Nano** for computer vision and Lidar processing.

## Custom Power Distribution Board (PDB)
The core of the electrical stack is a custom PDB schematic I designed to manage three 14.8V Li-ion battery packs. I prioritized failure prevention and telemetry over standard mechanical switching.

![PDB Schematic Placeholder](/assets/images/pdb-schematic.png)
*Figure 1: Custom PDB Schematic highlighting the solid-state latching logic and current sensing path.*

**Solid-State Master Switch**
I engineered a magnetic latching logic circuit using a **CD4013BE D-Flip-Flop** triggered by an external reed switch. This logic drives the gates of a parallel P-Channel MOSFET bank, allowing the vehicle to be powered on/off externally without penetrating the waterproof hull.

**Telemetry & Health Monitoring**
To monitor battery health, I integrated an **INA226** high-side current/power monitor and an **ATmega328P** MCU into the schematic. The MCU aggregates voltage, current, and thermistor data, reporting it to the main computer via I2C to trigger safety shutoffs if thermal or voltage limits are exceeded.

## Carrier Board Adaptation
To meet specific sensor requirements within the pressure vessel, I adapted open-source reference designs for both compute modules, customizing the schematics for specific I/O needs.

**Raspberry Pi CM5 Carrier**
I modified the reference schematic to integrate robust on-board buck converters, stepping down the 14.8V battery rail to stable 5V and 3.3V logic levels. I specifically broke out UART and Ethernet interfaces to support future acoustic modems for inter-vehicle swarm communication.

**Jetson Orin Nano Carrier**
For the AI engine, I customized the reference design to prioritize high-speed peripheral connectivity. I reconfigured the I/O mapping to support USB 3.0 interfaces for vision cameras and PCIe lanes for NVMe storage, ensuring the schematic supported the bandwidth required for real-time sensor fusion.

## Thermal Strategy
With no airflow inside the sealed hull, I specified a conductive cooling strategy in the bill of materials. I selected components and heat spreaders designed to interface mechanically with the aluminum chassis, allowing heat to transfer from the CPU/GPU directly to the pressure hull and into the ocean.
