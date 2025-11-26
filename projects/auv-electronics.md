---
layout: page
title: AUV Electronics Design
permalink: /projects/auv-electronics/
---

# Swarm-Style AUV Compute & Power Architecture

**Technologies:** KiCad, NVIDIA Jetson Nano, Raspberry Pi CM5, Power Electronics, Thermal Management.
**Context:** Internship at Boundary RSS (May 2025 – Aug 2025)

## The Problem
Developing autonomous underwater vehicles (AUVs) requires a balance between high-performance computing for AI navigation and strict power constraints. The existing solutions struggled with thermal management inside waterproof enclosures and lacked a streamlined way to integrate diverse sensors with the central compute module.

## The Solution
I architected a hierarchical compute system that optimized task distribution between a Raspberry Pi CM5 (flight control) and an NVIDIA Jetson Nano (AI processing). This involved designing custom carrier boards and a robust Power Distribution Board (PDB).

### Key Engineering Contributions

1.  **Hierarchical Compute Architecture:**
    *   Designed a system where the Pi CM5 handled real-time flight control while offloading heavy vision processing to the Jetson Nano.
    *   Created custom pin mappings to simplify data bus integration.

2.  **Custom Carrier Board Design:**
    *   Engineered schematics to support high-speed peripheral routing.
    *   [Insert details about a specific challenge, e.g., "Routed differential pairs for USB 3.0 interfaces to ensure signal integrity..."]

3.  **Power Distribution & Thermal Management:**
    *   Designed a PDB to manage battery health monitoring.
    *   Integrated a **passive cooling solution** effectively transferring heat to the waterproof enclosure's shell, ensuring thermal stability under load.

4.  **Component Sourcing:**
    *   Conducted system-level trade-off analysis for sensors and compiled a detailed BOM.

## Results
*   Successfully architected a compute system capable of real-time sensor fusion.
*   [Mention any specific metric if available, e.g., "Reduced cabling complexity by 40%"].

[Link to Documentation or Block Diagram if public]
