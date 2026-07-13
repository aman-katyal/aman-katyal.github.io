---
layout: default
title: "ROV Control Systems"
permalink: /projects/rov-systems
role: "Embedded Firmware & Electrical"
description: "Hardware-in-the-Loop (HIL) testbench and peripheral interface board for MATE ROV, enabling firmware development and real-time comparison of STM32/RP2350."
technologies: ["STM32", "RP2350B", "Raspberry Pi 5", "SPI/I2C/UART", "FreeRTOS", "KiCad"]
printable: true
order: 3
---

**Context:** Purdue IEEE ROV Team | **MATE ROV Competition**
A Remotely Operated Vehicle (ROV) is an unoccupied, highly maneuverable underwater robot controlled by a crew on the surface. These vehicles are used across the marine industry for everything from deep-sea research and oil rig maintenance to shipwreck exploration.

The MATE (Marine Advanced Technology Education) ROV Competition is an international engineering challenge that mirrors these real-world applications. Teams are treated as "companies" that must design, manufacture, and market a vehicle capable of completing complex underwater missions. Competing in the Pioneer/Explorer class requires our team to engineer systems that can handle high-pressure environments, manage sophisticated power distribution, and execute precise autonomous maneuvers. The following projects represent my contributions to the vehicle's electrical and software infrastructure to meet these rigorous standards.

---

## HIL Testbench and Peripheral Control Board

The primary bottleneck in our vehicle development was the dependency on a completed 6 board electrical stack before any software could be validated. To solve this, I designed a surface level Hardware-in-the-Loop (HIL) carrier board that replicates the ROV core control architecture. This simplified platform allows the software team to develop and debug embedded code months before the final vehicle assembly is ready for testing.

### System Architecture and Dual MCU Integration

The board serves as a central hub for a Raspberry Pi 5 and two separate microcontrollers, facilitating the transition from high-level autonomous commands to low-level hardware execution. By mounting the Pi directly to the carrier, we created a stable environment to test the interactions between the primary compute unit and the dual MCU setup.

A major focus of this design is facilitating a potential architecture migration. The board currently hosts both an STM32 and an RP2350B to evaluate whether the RP2350B can meet our specific processing and timing requirements. To allow for real-time comparison and testing, I implemented a muxing system for the output signals. This allows us to toggle control of the thruster ESCs and servos between the two microcontrollers without hardware reconfiguration. I also broke out all unused pins from both MCUs to external headers, ensuring we have full access for oscilloscope probing or testing additional peripherals as the firmware evolves.

### Peripheral Communication and Telemetry

Communication across the board is handled through a specific hierarchy of protocols. The Raspberry Pi 5 utilizes an SPI interface to command the microcontrollers, which then manage the high-frequency tasks of generating PWM signals for the thrusters and servos. For environmental awareness, I integrated a sensor suite that aggregates data from the IMU, depth sensor, and leak detection modules via I2C. Additionally, I implemented UART channels specifically for capturing real-time telemetry from the Electronic Speed Controllers (ESCs). This provides critical feedback on motor performance and current draw during surface runs, which is essential for validating our control loops before they are deployed on the ROV.

### Power Regulation and Distribution

Because the board is intended for surface testing, it is powered by a separate external power distribution board that provides 12V and 5V rails. My design manages the subsequent conversion and distribution to ensure each component receives the correct voltage without interference.

I engineered the power section to step down the incoming 12V rail to 6V specifically for high-torque servo operation. To support the logic side of the system, I designed a regulation stage that converts the 5V input to a stable 3.3V supply. This rail powers both microcontrollers and the various I2C sensors, maintaining a clean logic level across the entire testbench. This power architecture mirrors the complexity of the full ROV while remaining optimized for a desk-side development environment.

---
<img width="1035" height="auto" alt="mcu and pi board" src="https://github.com/user-attachments/assets/c372b716-f19f-46da-be7e-866f1f1b793e" />

<img width="878" height="auto" alt="Screenshot 2026-02-27 165804" src="https://github.com/user-attachments/assets/ffc42217-b6ea-43cd-82f3-94ce471c0b6c" />

The primary challenge for this autonomous cylinder is to reach and maintain specific target depths with high accuracy, often while navigating shifting water densities. The float is designed to descend to a programmed depth, dwell to collect a suite of environmental data, and then return to the surface to transmit those data packets to the ground station.

## Autonomous Buoyancy Float

Outside of the main ROV, our team utilizes an autonomous buoyancy float designed for vertical profile data collection. The device is a self-contained cylinder that moves up and down through the water column by changing its volume. While the physical hardware—including the linear actuator and syringe-based buoyancy engine—was established in a previous year, I am currently leading a complete overhaul of the float's "brain" to move from legacy scripting to high-performance firmware.

### Firmware Migration and Hardware Optimization

The float was originally running on CircuitPython, which served as a functional starting point but lacked the granular hardware control needed for complex mission profiles. I am migrating the entire codebase to **C** on an **Adafruit Feather RP2040**. This shift allows for deeper optimization of the RP2040’s dual-core architecture and provides low-level control over the peripheral registers, which is essential for maximizing the efficiency of the linear actuator and sensor interfaces.

### Persistent Storage and Over-the-Air Tuning

One of the primary challenges with underwater robotics is that the electronics are inaccessible once the pressure vessel is sealed. To eliminate the need to open the enclosure for software tweaks, I developed a dynamic tuning and storage system:

* **LittleFS Integration:** I implemented the **LittleFS** file system to manage the RP2040’s onboard flash memory. This allows the float to store PID constants as persistent files. Unlike standard memory, these values survive power cycles, ensuring the float maintains its tuned behavior throughout a deployment without requiring a hard-coded reflash.
* **LoRa Remote Tuning:** I integrated an **RFM9x LoRa radio module** to establish a long-range communication link with the ground station. I designed a custom command protocol that allows us to send new PID tuning constants over the radio while the float is in the water. Once a packet is received, the float updates its active control loop and automatically saves the new parameters to flash via LittleFS. This "Over-the-Air" tuning capability allows for rapid iteration of the buoyancy engine’s performance in real-world conditions.

### Mission Execution and Surface Telemetry

During a typical mission, the float must achieve a specific depth setpoint with high precision to ensure data integrity. I developed the logic that handles the transition between data collection at depth and the surfacing phase. Once the float detects it has reached the surface via the pressure sensor, it initiates a transmission sequence, sending the gathered packets of IMU, depth, and temperature data over the LoRa link.

To interface with the float, I built a dedicated ground station using a second Adafruit Feather and LoRa module. This unit acts as a gateway, receiving data packets from the float and piping them to a laptop via serial. I developed a **Python-based front-end** to process this serial stream and provide a real-time UI for the team. The dashboard visualizes live plots of the sensor data, which is the primary tool for validating that the buoyancy engine hit its target depth with the required accuracy.
