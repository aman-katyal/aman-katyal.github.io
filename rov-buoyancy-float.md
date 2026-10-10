---
layout: default
title: "Autonomous Buoyancy Float"
permalink: /projects/rov-buoyancy-float/
role: "Embedded Systems & Firmware Architecture"
description: "Autonomous underwater profiling float powered by RP2040 bare-metal C firmware, featuring multi-rate closed-loop depth PID with neutral baseline feedforward, SX1276 LoRa telemetry, LittleFS persistent storage, and an in-situ bsdiff OTA secondary bootloader."
technologies: ["RP2040 (Bare-Metal C)", "LittleFS", "LoRa SX1276", "PID Control", "OTA Bootloader (bsdiff)", "Python / Streamlit", "HIL Simulation", "MS5837 Depth Sensor"]
image: "/assets/images/buoyancy_preview.jpg"
printable: true
order: 2
---

**Context:** Purdue IEEE ROV Team | **MATE ROV Competition**

Outside of the primary competition ROV, our team deploys an autonomous profiling buoyancy float engineered for automated vertical data collection in the water column. The float is a self-contained, tetherless cylindrical pressure vessel that modulates its net buoyancy by actively changing its displaced volume. 

While the mechanical cylinder—incorporating a 90 mL syringe-driven variable buoyancy engine (VBE) and linear actuator—was physically fabricated, I led the complete architectural redesign and firmware overhaul of the float's embedded "brain." Migrating from legacy interpreted CircuitPython scripts to bare-metal **C on the Raspberry Pi Pico / Adafruit Feather RP2040**, I architected a deterministic multi-rate control system, an adaptive neutral-buoyancy depth controller, an RF telemetry link, and an in-situ secondary bootloader with differential binary patching.

---

## Hardware Architecture & Vehicle Packaging

<div class="image-grid-2col">
  <figure class="figure-card contain-fit">
    <div class="figure-image-container">
      <img src="/assets/images/rov_buoyancy_cad.png" alt="CAD Assembly Model of Autonomous Buoyancy Float Cylinder">
    </div>
    <figcaption class="figure-caption">
      <i class="fa-solid fa-cube"></i>
      <span><strong>Mechanical CAD Assembly:</strong> 3-view render illustrating the clear acrylic pressure hull, brass endcaps with recovery bridle, internal 18650 battery chassis, and central linear actuator syringe buoyancy engine.</span>
    </figcaption>
  </figure>

  <figure class="figure-card">
    <div class="figure-image-container">
      <img src="/assets/images/rov_buoyancy_pcb.jpg" alt="Physical Internal Electronics Stack and Custom Carrier PCB">
    </div>
    <figcaption class="figure-caption">
      <i class="fa-solid fa-microchip"></i>
      <span><strong>Physical Electronics Stack:</strong> Custom circular carrier PCB mated to an RP2040 daughterboard, onboard SX1276 LoRa radio, automotive blade fuse protection, USB-C debug interface, and 18650 Li-ion battery cylinder bundle.</span>
    </figcaption>
  </figure>
</div>

The physical packaging is constrained to a compact vertical cylinder rated for hydrostatic pressures in excess of 3 bar:
* **Custom Circular Carrier Board:** Designed to match the internal hull diameter, breaking out power regulation, an automotive blade fuse socket, JST-GH locking connectors, and dedicated SPI/I2C buses.
* **Variable Buoyancy Engine (VBE):** A 90 mL medical-grade syringe driven by a high-torque DC motor through a stainless steel lead screw. Retraction draws ambient water inward (reducing vehicle displacement to sink); extension expels water outward (increasing displacement to ascend).
* **Positional Feedback:** A 10 kΩ linear potentiometer mechanically coupled to the syringe piston is sampled via the RP2040's 12-bit ADC (ADC0, Pin 26), yielding 0–4095 discrete positional counts.
* **Environmental Sensor Suite:** An external **TE MS5837-02BA** piezoresistive pressure/depth sensor ($0.02\text{ mbar}$ resolution, sub-centimeter depth precision) and an internal **BNO085 9-DOF IMU** for vehicle attitude and roll/pitch monitoring.

---

## Dual-MCU Topology & Subsea RF Constraints

Subsea radio communications are heavily constrained by water physics: electromagnetic signals at 433 MHz / 915 MHz suffer severe attenuation in water (effectively zero range once submerged past several centimeters). To resolve this, I implemented a decoupled two-node architecture:

```
+-------------------------------------------------------------------------+
| Ground Station PC: Python / Streamlit Mission Control Dashboard         |
+-------------------------------------------------------------------------+
                                    ▲
                   USB CDC Serial (115,200 baud)
                                    ▼
+-------------------------------------------------------------------------+
| Surface Station Gateway (RP2040): SX1276 LoRa Radio (SPI0)             |
+-------------------------------------------------------------------------+
                                    ▲
                 LoRa RF (915 MHz, SF7, 125 kHz BW)
                     [Active only while Surfaced]
                                    ▼
+-------------------------------------------------------------------------+
| Autonomous Float Unit (RP2040): Fully Autonomous Control Loop           |
|  - 50 Hz Actuator Loop (H-Bridge PWM & Potentiometer ADC0)              |
|  - 10 Hz Depth Loop (MS5837 I2C Sensor + Neutral Feedforward PID)       |
|  - Mission FSM & 3-Tier Sensor Recovery Failsafe                        |
|  - LittleFS Flash Storage & bsdiff Secondary Bootloader                 |
+-------------------------------------------------------------------------+
```

1. **Autonomous Float Unit (Underwater):** Operates completely untethered once submerged. It autonomously executes depth transitions, dwell profiles, and sensor logging without requiring a live telemetry uplink.
2. **Surface Station Gateway:** Floats at the pool edge or connects via USB to the operator's laptop. It handles bidirectional packet forwarding, command handshakes, and post-dive data dumps when the float breaks the surface.

---

## Deterministic Multi-Rate Firmware Architecture

Under interpreted CircuitPython, garbage collection pauses and unbuffered peripheral drivers caused unacceptable timing jitter and missed sensor deadlines. I re-architected the firmware in bare-metal C targeting the **RP2040's dual ARM Cortex-M0+ cores (@ 133 MHz)** using a single-core, non-blocking multi-rate scheduler:

```c
// Deterministic Multi-Rate Main Execution Loop (src/float_main.c)
while (1) {
    watchdog_update();
    console_update(); // Parse incoming serial / radio buffer

    // High-Rate Inner Loop: 50 Hz (20 ms) Actuator Motor Control
    if (time_us_64() - last_act_time >= 20000) {
        last_act_time = time_us_64();
        actuator_update(target_adc_position);
    }

    // Medium-Rate Outer Loop: 10 Hz (100 ms) Depth PID & Pressure Sampling
    if (time_us_64() - last_pid_time >= 100000) {
        last_pid_time = time_us_64();
        if (ms5837_read(&depth_sensor)) {
            current_depth = ms5837_get_depth(&depth_sensor) - depth_offset;
            target_adc_position = depth_pid_compute(&pid, current_depth, target_depth);
            sensor_fail_strikes = 0;
        } else {
            handle_sensor_failure(&sensor_fail_strikes);
        }
    }

    // Mission Lifecycle State Machine & Radio Packet Dispatch
    float_fsm_update(&global_fsm);
}
```

### 1. 50 Hz Inner Actuator Loop
The lead-screw drive requires high-bandwidth control to prevent mechanical overshoot and jamming:
* **Anti-Hunting Hysteresis:** An entry deadband of 20 ADC counts and exit deadband of 50 counts prevents continuous motor chatter when holding position.
* **Hardware Stall Protection:** If the H-bridge is driven actively but the potentiometer ADC position shifts by $\Delta\text{ADC} < 15$ counts over a 1.0-second window, the driver immediately shuts off power to prevent H-bridge FET thermal overload.
* **Soft Bounds Clamping:** Software-enforced travel bounds (`ActMin: 120`, `ActMax: 3900`) safeguard the physical syringe from bottoming out or unsealing the piston.

### 2. 10 Hz Outer Depth Loop & 3-Tier Sensor Recovery
Buoyancy physics exhibit substantial hydrodynamic inertia. Sampling depth at 10 Hz cleanly filters high-frequency surface wave chop while providing responsive control. To safeguard against subsea I2C bus lockups, I implemented a progressive 3-tier recovery matrix:
* **Tier 1 (5 failed reads):** Issue soft sensor reset command over I2C.
* **Tier 2 (15 failed reads):** Cycle peripheral I2C clock line to clear wedged slave devices and re-initialize bus hardware registers.
* **Tier 3 (50 failed reads):** Trigger critical mission abort—override motor PWM to drive the syringe to `ActMax` (full positive buoyancy) and blow to the surface.

---

## Buoyancy Dynamics & Neutral Baseline Feedforward

The net vertical hydrodynamic force acting on the float cylinder is governed by:

$$F_{net} = F_{buoyancy} - F_{gravity} - F_{drag} = \rho(T, P) \cdot g \cdot V_{total}(P, \text{ADC}) - m \cdot g - \frac{1}{2} C_d A \rho v |v|$$

In typical terrestrial robotics, PID controllers output motor velocity or acceleration directly proportional to position error $e(t) = d_{target} - d_{actual}$. In underwater buoyancy systems, this naive strategy fails catastrophically: when the float reaches its target depth ($e(t) = 0$), a standard PID commands zero motor action, leaving the buoyancy engine in whatever state it was moving in, triggering massive overshoot and persistent vertical oscillations.

```
       [ Depth Error e(t) ]
                 │
                 ▼
       ┌───────────────────┐
       │   Depth PID (10Hz)│ ──► u(t) = Kp*e + Ki*∫e + Kd*de/dt
       └───────────────────┘
                 │
                 ▼
       ┌───────────────────┐
       │ Neutral Feedforward│ ──► Target ADC = Neutral_ADC + clamp(u(t))
       └───────────────────┘
                 │
                 ▼
       ┌───────────────────┐
       │ Actuator Loop(50Hz)│ ──► Drives H-Bridge PWM to match Potentiometer ADC
       └───────────────────┘
```

### Neutral ADC Feedforward Solution
To achieve rock-solid depth holds, the control law calculates absolute syringe position relative to a calibrated **Neutral Buoyancy ADC Baseline** ($N_{adc} \approx 1850$ counts):

$$\text{Target ADC} = N_{adc} + \text{clamp}\left(K_p e(t) + K_i \int e(t) dt + K_d \frac{de(t)}{dt},\, \text{ActMin} - N_{adc},\, \text{ActMax} - N_{adc}\right)$$

* When depth error reaches zero, the syringe automatically returns to $N_{adc}$, holding neutral buoyancy equilibrium effortlessly.
* **Adaptive Hover Learning:** During the dwell hold stage within the depth arrival tolerance ($\pm 0.33\text{ m}$), the float samples and averages actual holding positions:
  $$\overline{ADC}_{hover} = \frac{1}{K}\sum_{i=1}^{K} ADC_i$$
  Upon surfacing, this learned baseline is automatically written to LittleFS flash, compensating for variations in water salinity, temperature gradients, and vehicle payload shifts without manual re-tuning.

---

## Mission Finite State Machine (FSM)

The vehicle's autonomous lifecycle is managed by an explicit Finite State Machine (`lib/fsm/float_fsm.c`):

| State | LED Feedback (PIO NeoPixel) | Operational Behavior & Transitions |
| :--- | :--- | :--- |
| **`FLOAT_IDLE`** | 🟢 Green | Resting on surface; listening for LoRa radio commands via Channel Activity Detection (CAD). |
| **`FLOAT_PRE_DIVE`** | 🟡 Yellow | Command received; zeros depth pressure sensor offset and transmits pre-dive verification packet. |
| **`STAGE_DEEP`** | 🔵 Blue | Retracts syringe to descend toward deep target (e.g. 2.50 m); activates neutral feedforward braking. |
| **`STAGE_SHALLOW`** | 🔵 Blue | Expels water to ascend to shallow target; holds position for designated profile duration (75 s timeout). |
| **`STAGE_EXITING`** | 🔵 Blue | Drives syringe to `ActMax` (full positive buoyancy); ascends to surface ($d < 0.15\text{ m}$). |
| **`FLOAT_PROFILE_DONE`** | 💠 Cyan | Surfaced; broadcasts recovery beacon packet every 3 seconds awaiting ground station handshake. |
| **`FLOAT_DUMPING_DATA`** | 🟣 Magenta | Offloads time-series depth, pressure, and actuator logs via Stop-and-Wait ARQ with 32-bit CRC. |

*Visual feedback is generated using the RP2040's hardware Programmable I/O (PIO0) to bit-bang WS2812 RGB LED timing with zero CPU overhead and zero interrupt latency.*

---

## In-Situ OTA Bootloader & `bsdiff` Differential Patching

Opening the sealed acrylic pressure hull in the field degrades silicone O-rings, introduces moisture into the desiccant-protected hull, and consumes 30–45 minutes of critical pool testing time. To enable true field agility, I developed an **in-situ secondary OTA bootloader**.

```
RP2040 2MB Internal Flash Memory Layout:
0x0000_0000 +------------------------------------------+
            | Bootloader (32 KB)                       |
0x0000_8000 +------------------------------------------+
            | Slot 0: Active Application Firmware      | (Up to ~992 KB)
0x0010_0000 +------------------------------------------+
            | Slot 1: Differential Patch Staging Area  | (1024 KB)
0x0020_0000 +------------------------------------------+
            | Slot 2: LittleFS Configuration & Logs    |
            +------------------------------------------+
```

### Why Differential `bsdiff` Compression?
* A complete compiled RP2040 application binary occupies **~180 KB – 220 KB**.
* Over a 9600-baud LoRa link with checksum validation and packet acknowledgement, transferring 200 KB takes **5 to 8 minutes** and carries significant exposure to packet dropouts.
* Routine code changes (such as modifying PID constants, stage dwell timers, or calibration routines) alter only **2 KB – 8 KB** of compiled machine code.
* By implementing `bspatch` inside the RP2040 secondary bootloader, we transmit only the binary delta over LoRa. Firmware updates flash over-the-air in **under 20 seconds**.

### Bootloader Handoff Protocol
1. **Patch Transmission:** The surface station slices the patch into 64-byte CRC-checked chunks written into Flash Slot 1 (`0x00100000`).
2. **Watchdog Scratch Handoff:** Once fully validated, the application writes `0xDEADBEEF` into the hardware watchdog register `watchdog_hw->scratch[0]` and triggers a reboot.
3. **Bootloader Execution:** Upon reboot, the bootloader inspects the scratch register. If the magic word matches, it reads the active firmware in Slot 0, reconstructs the new binary using `bspatch`, flashes Slot 0, clears the scratch register, updates `SCB_VTOR` (Vector Table Offset Register), and branches to the new application.

---

## Mission Control Dashboard & HIL Simulation

<figure class="figure-card">
  <div class="figure-image-container">
    <img src="/assets/images/rov_buoyancy_dashboard.png" alt="X18 Mission Control Dashboard showing real-time 10Hz closed-loop depth profiling and telemetry">
  </div>
  <figcaption class="figure-caption">
    <i class="fa-solid fa-chart-line"></i>
    <span><strong>X18 Mission Control Dashboard (Python / Streamlit):</strong> Closed-loop dive profile visualization displaying live depth response (cyan), arrival tolerance bands (red), physical potentiometer ADC feedback (orange), and real-time serial telemetry streaming.</span>
  </figcaption>
</figure>

To monitor field trials and tune controller parameters, I created the **X18 Mission Control Dashboard** in Python and Streamlit (`front_end/main.py`):
* **Thread-Safe Telemetry Driver:** A background serial worker thread parses incoming `[SYNC]`, `[TELEMETRY]`, and `[HIL_OUT]` packets into ring buffers protected by thread locks, completely decoupling high-speed serial I/O from browser rendering.
* **Live Closed-Loop Visualizer:** Renders real-time Plotly charts tracking depth versus target setpoints alongside actuator physical travel.
* **Hardware-in-the-Loop (HIL) Simulator:** When bench-testing without water, the firmware boots in `#ifdef HIL_MODE`. A high-fidelity hydrodynamics engine models pure water density using the **UNESCO EOS-80** equation of state, simulating hull bulk modulus compressibility ($\beta_p = 3.3 \times 10^{-6}\text{ dbar}^{-1}$), thermal expansion ($\alpha_v = 6.9 \times 10^{-5}\text{ K}^{-1}$), and quadratic drag ($C_d = 0.82$, $C_a = 0.33$). The physical actuator moves on the desk while receiving simulated depth feedback over serial.

---

## Key Technical Specifications

| Subsystem | Specification / Configuration | Engineering Rationale |
| :--- | :--- | :--- |
| **Main Processing Unit** | RP2040 Dual ARM Cortex-M0+ @ 133 MHz | Low cost, dual cores, 264 KB SRAM, programmable PIO for timing-critical peripherals. |
| **Buoyancy Engine** | 90 mL Syringe driven by Lead Screw & DC Motor | Active volume displacement with high volumetric efficiency; power-off mechanical self-locking. |
| **Position Feedback** | 10 kΩ Linear Potentiometer (12-bit ADC0) | Sub-millimeter linear stroke tracking with hardware filtering and stall detection. |
| **Depth Sensor** | MS5837-02BA Piezoresistive I2C (0.02 mbar) | Sub-centimeter hydrostatic depth measurement with OSR 8192 oversampling. |
| **Wireless Link** | SX1276 LoRa (915 MHz, SF7, 125 kHz BW) | Long-range penetration for surface telemetry and recovery beaconing. |
| **Local File Storage** | LittleFS on 2 MB SPI Flash | Power-loss resilient storage for PID configurations, offsets, and mission time-series logs. |
| **In-Situ Bootloader** | Dual-Slot Secondary Bootloader with `bsdiff` | Enables sub-20-second Over-The-Air code patches without unsealing the pressure hull. |
| **Surface Station** | Python / Streamlit + Decoupled RP2040 Gateway | Non-blocking telemetry plotting, real-time gain tuning, and physics-based HIL validation. |

