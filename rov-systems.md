---
layout: default
title: "ROV Control Systems"
permalink: /projects/rov-systems
printable: true
order: 3
---

# Unified ROV Control & Verification Architecture


# Purdue IEEE ROV: Engineering Portfolio

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
<img width="1475" height="auto" alt="mcu and pi board" src="https://github.com/user-attachments/assets/003e8ea1-235f-47e9-8f6d-c46aac6157c0" />
<img width="878" height="926" alt="Screenshot 2026-02-27 165804" src="https://github.com/user-attachments/assets/ffc42217-b6ea-43cd-82f3-94ce471c0b6c" />
