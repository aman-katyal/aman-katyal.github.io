---
layout: default
title: "ROV HIL Testbench & Control Board"
permalink: /projects/rov-hil-testbench/
role: "Embedded Firmware & Electrical"
description: "Hardware-in-the-Loop (HIL) carrier board and testbench for MATE ROV, enabling firmware development and real-time comparison of STM32/RP2350."
technologies: ["STM32F091", "RP2350B", "Raspberry Pi 5", "SPI/I2C/UART", "KiCad"]
image: "/assets/images/rov_hil_render_iso.png"
printable: true
order: 1
timeline: "2024 – 2025"
---

**Context:** Purdue IEEE ROV Team | **MATE ROV Competition**

A Remotely Operated Vehicle (ROV) is an unoccupied, highly maneuverable underwater robot controlled by a crew on the surface. These vehicles are used across the marine industry for everything from deep-sea research and oil rig maintenance to shipwreck exploration.

The MATE (Marine Advanced Technology Education) ROV Competition is an international engineering challenge that mirrors these real-world applications. Teams are treated as "companies" that must design, manufacture, and market a vehicle capable of completing complex underwater missions. Competing in the Pioneer/Explorer class requires our team to engineer systems that can handle high-pressure environments, manage sophisticated power distribution, and execute precise autonomous maneuvers.

To overcome development bottlenecks, I designed a surface-level Hardware-in-the-Loop (HIL) carrier board that replicates the ROV core control architecture, allowing the software team to validate firmware months before final vehicle assembly.

## System Architecture and Dual MCU Integration

The board serves as a central hub for a Raspberry Pi 5 and two separate microcontrollers, facilitating the transition from high-level autonomous commands to low-level hardware execution. By mounting the Pi directly to the carrier, we created a stable environment to test the interactions between the primary compute unit and the dual MCU setup.

A major focus of this design is facilitating a potential architecture migration. The board currently hosts both an STM32F091 and an RP2350B to evaluate whether the RP2350B can meet our specific processing and timing requirements. To allow for real-time comparison and testing, I implemented a muxing system for the output signals. This allows us to toggle control of the thruster ESCs and servos between the two microcontrollers without hardware reconfiguration. I also broke out all unused pins from both MCUs to external headers, ensuring we have full access for oscilloscope probing or testing additional peripherals as the firmware evolves.

The carrier is a custom 4-layer PCB designed in KiCad, with dedicated power and ground planes beneath the signal routing. The Raspberry Pi 5 mates through a Molex connector rather than a loose cable harness, keeping the high-level compute unit mechanically secure while the backplane distributes servo, ESC, sensor, and telemetry signals across the bench.

<figure class="figure-card">
  <div class="figure-image-container">
    <img src="/assets/images/rov_hil_render_top.png" alt="Top-down 3D render of the HIL carrier board with the Raspberry Pi 5 mated, STM32 and RP2350B footprints, servo and ESC backplane connectors, and the multi-rail power section">
  </div>
  <figcaption class="figure-caption">
    <i class="fa-solid fa-microchip"></i>
    <span><strong>Topside HIL Carrier (Top View):</strong> Fully populated carrier showing the Raspberry Pi 5 mounting area, dual-MCU section, backplane connectors, and the regulated servo and logic power stages.</span>
  </figcaption>
</figure>

## Peripheral Communication and Telemetry

Communication across the board is handled through a specific hierarchy of protocols. The Raspberry Pi 5 utilizes an SPI interface to command the microcontrollers, which then manage the high-frequency tasks of generating PWM signals for the thrusters and servos. For environmental awareness, I integrated a sensor suite that aggregates data from the IMU, depth sensor, and leak detection modules via I2C. Additionally, I implemented UART channels specifically for capturing real-time telemetry from the Electronic Speed Controllers (ESCs). This provides critical feedback on motor performance and current draw during surface runs, which is essential for validating our control loops before they are deployed on the ROV.

Separating these buses by role keeps the high-rate host link independent of the slower sensor and telemetry traffic. The Pi can issue command frames over SPI without contending with IMU or depth samples on the I2C bus, while ESC telemetry arrives on its own UART channels for logging alongside the control-loop data.

## Power Regulation and Distribution

Because the board is intended for surface testing, it is powered by a separate external power distribution board that provides 12V and 5V rails. My design manages the subsequent conversion and distribution to ensure each component receives the correct voltage without interference.

I engineered the power section to step down the incoming 12V rail to 6V specifically for high-torque servo operation. To support the logic side of the system, I designed a regulation stage that converts the 5V input to a stable 3.3V supply. This rail powers both microcontrollers and the various I2C sensors, maintaining a clean logic level across the entire testbench. This power architecture mirrors the complexity of the full ROV while remaining optimized for a desk-side development environment.

## Hardware Specifications

| Subsystem | Implementation |
| --- | --- |
| Compute | Raspberry Pi 5, Molex-mated to the carrier as the high-level autonomy host |
| Microcontrollers | STM32F091CCT6 and RP2350B, both populated for side-by-side architecture evaluation |
| Host link | SPI from the Raspberry Pi 5 to the microcontroller layer |
| Sensor bus | I2C bus aggregating IMU, depth, and leak-detection modules over JST-GH connectors |
| ESC telemetry | Dedicated UART channels for real-time motor current and RPM feedback |
| Servo rail | Regulated 6V rail for high-torque servo operation |
| Logic rail | Regulated 3.3V rail for both MCUs and the I2C sensor suite |
| Input rails | 12V and 5V supplied by an external topside power distribution board |
| PCB | Custom 4-layer carrier board designed in KiCad |
| Debug access | Unused GPIO from both MCUs broken out to headers for scope probing and peripherals |

## Validation & Bring-Up

The primary purpose of the board is schedule compression: firmware bring-up can begin months before the vehicle is assembled. Instead of waiting for a complete ROV, the software team can run the real control stack against real sensors, ESCs, and servo outputs on a desk-side testbench, then carry the validated firmware into the vehicle with far fewer integration surprises.

The dual-MCU layout turns that bring-up into a controlled comparison. The same peripherals and backplane are available to both the STM32F091 and the RP2350B, so the team can evaluate each platform's behavior under identical workloads. The muxed ESC and servo outputs let us switch which MCU drives the thrusters and control surfaces without rewiring the bench, making A/B tests repeatable and keeping the two firmware targets isolated from one another.

Bring-up follows the board from power to protocol. The 12V, 6V, 5V, and 3.3V rails are checked in sequence before the Pi and MCUs are mated, then the SPI host link, I2C sensor bus, and UART telemetry channels are exercised independently. Because unused GPIO from both microcontrollers is broken out, I can put a scope directly on the breakout headers to correlate SPI transactions, PWM edges, UART frames, and rail sequencing while the firmware is running. That visibility is what makes the testbench useful for debugging timing and peripheral issues rather than merely proving that the board powers on.

<figure class="figure-card">
  <div class="figure-image-container">
    <img src="/assets/images/rov_hil_schematic.svg" alt="KiCad root schematic for the HIL carrier showing the Raspberry Pi 5, STM32F091, RP2350B, power distribution, and backplane connections">
  </div>
  <figcaption class="figure-caption">
    <i class="fa-solid fa-diagram-project"></i>
    <span><strong>HIL Carrier Root Schematic:</strong> Top-level KiCad sheet tying together the Raspberry Pi 5 host, STM32F091 and RP2350B, power distribution, and the servo/ESC backplane for bench bring-up.</span>
  </figcaption>
</figure>

---

![HIL Carrier Board 3D render, Raspberry Pi mated](/assets/images/rov_hil_render_iso.png)

![Top copper layer: power and signals](/assets/images/rov_hil_layer_ftop.svg)
