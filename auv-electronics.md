---
layout: default
title: "AUV Electronics Design"
permalink: /projects/auv-electronics
printable: true
order: 1
---
[← Back to Home](/)
# Swarm-Style AUV Compute & Power Architecture

**Technologies:** KiCad, NVIDIA Jetson Nano, Raspberry Pi CM5, Thermal Management.
**Context:** Internship at Boundary RSS

## The Problem
Developing autonomous underwater vehicles (AUVs) requires balancing high-performance AI compute with strict power and thermal constraints inside a sealed, waterproof enclosure.

## The Solution
I architected a hierarchical compute system, optimizing task distribution between a Raspberry Pi CM5 (real-time flight control) and NVIDIA Jetson Nano (AI sensor processing).

### Key Contributions
*   **Custom Carrier Board:** Designed complex schematics with custom pin mappings to support high-speed peripheral routing and simplify data bus integration.
*   **Thermal Engineering:** Integrated a passive cooling solution into the Power Distribution Board (PDB) to transfer heat to the enclosure shell, maintaining stability under load.
*   **System Analysis:** Conducted trade-off analysis for sensor modalities and compiled the final Bill of Materials (BOM).

[Link to GitHub/Documentation]
