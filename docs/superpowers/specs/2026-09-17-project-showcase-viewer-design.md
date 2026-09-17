# Design Specification: Interactive Project Showcase Viewer

- **Date:** 2026-09-17
- **Target Repository:** `aman-katyal.github.io`
- **Status:** Approved / In Review

---

## 1. Overview & Purpose

Transition the project presentation on the portfolio from full-length, report-heavy pages into a concise, image-driven, interactive showcase. Visitors can preview photos, schematics, CAD renders, and punchy engineering highlights directly without navigating to separate long report pages, drawing inspiration from:
- **`snadol.com`**: In-page modal viewer with multi-image gallery/thumbnails, high-res lightbox, bulleted technical highlights (`▹`), and categorized skills badge clusters (Languages, Technologies, Protocols).
- **`thavlik.dev`**: Sleek terminal-style card headers (`termbar`), clean media frames, and structured technical summaries with clear direct action links.

The detailed markdown files (`asic-design.md`, `rov-buoyancy-float.md`, etc.) are retained in the codebase to power the existing print/PDF portfolio generator, but web visitors interact solely with the high-impact visual viewer.

---

## 2. Architecture & Data Model

### 2.1 Centralized Project Data (`_data/projects.yml`)
To keep the site maintainable and decouple project metadata from page layout templates, all projects are defined in `_data/projects.yml`.

Schema per project entry:
```yaml
- id: "string (e.g. ml-dueling)"
  title: "string"
  subtitle: "string (e.g. Asymmetric Dual-Core RP2350 Gesture Recognition)"
  category: "string (e.g. Embedded Hardware & ML)"
  badge_type: "string (e.g. embedded / hardware / open-source)"
  role: "string"
  year: "string"
  github: "string (URL)"
  live: "string (URL or empty)"
  summary: "string (1-2 sentence engineering overview)"
  highlights:
    - "string (concise bullet point)"
  skills:
    languages: ["string"]
    technologies: ["string"]
    protocols: ["string"]
  images:
    - src: "string (path to image)"
      label: "string (caption/description)"
      featured: boolean
```

### 2.2 Projects Included
1. **ASIC & Digital Design Portfolio** (`asic-design`):
   - Images: `asic_preview.jpg`, `ahb_rtl.png`, `ahb_fsm.png`
   - Highlights: APB UART peripheral, AHB-Lite SRAM controller, 400MHz SkyWater 130nm timing closure.
   - Skills: SystemVerilog, APB, AHB-Lite, OpenLane, Synopsys DC.
2. **RISC-V FPU Verification (UVM/DPI-C)** (`risc-v-verification`):
   - Images: `riscv_preview.jpg`
   - Highlights: Tape-out verification for AFTx SoC, IEEE 754 compliance, C/C++ DPI-C golden reference model, 100% functional coverage.
   - Skills: SystemVerilog, UVM, C/C++, DPI-C, Vivado.
3. **ROV HIL Testbench & Control Board** (`rov-hil-testbench`):
   - Images: `rov_hil_carrier.png`, `rov_hil_schematic.png`
   - Highlights: Surface-level HIL carrier board, Raspberry Pi 5 + STM32 / RP2350B dual-MCU architecture, hardware output muxing, power monitoring.
   - Skills: STM32, RP2350B, Raspberry Pi 5, FreeRTOS, KiCad, SPI/I2C/UART.
4. **Autonomous Buoyancy Float** (`rov-buoyancy-float`):
   - Images: `buoyancy_preview.jpg`, `rov_buoyancy_pcb.png`, `rov_buoyancy_cad.png`, `rov_buoyancy_dashboard.png`
   - Highlights: Bare-metal RP2040 C firmware, 10 Hz depth PID + 1 Hz feedforward control, SX1276 LoRa telemetry, bsdiff differential OTA bootloader.
   - Skills: RP2040 (Bare-Metal C), LittleFS, SX1276 LoRa, PID Control, Streamlit.
5. **ML Gesture Dueling System** (`ml-dueling`):
   - Images: `dueling_preview.jpg`, `wand_pcb_1.jpg` (`PXL_20251213_200656652.jpg`), `wand_pcb_2.jpg` (`PXL_20251213_200640646.jpg`)
   - Highlights: Asymmetric dual-core RP2350 architecture, Core 1 TFLite Micro inference (96% gesture accuracy), Core 0 jitter-free game loop & haptics, custom 4-layer PCB in KiCad.
   - Skills: RP2350, Edge Impulse (TFLite), C/C++, FreeRTOS, KiCad.
6. **ESP32 Game Controller Bridge** (`esp32-bridge`):
   - Images: `esp32_preview.jpg`
   - Highlights: Bit-accurate Nintendo Switch Pro Controller emulation via TinyUSB stack, Bluetooth HID interception with <5ms latency, FreeRTOS dual-task pipeline.
   - Skills: ESP32-S3, C++, ESP-IDF, TinyUSB, Bluedroid BT, FreeRTOS.

---

## 3. UI Component Specifications

### 3.1 Homepage Project Card (`thavlik.dev` + Modern Portfolio)
- **Terminal Header (`termbar`)**:
  - Displays project title in monospace/bold style.
  - Category pill on the right (e.g., `Embedded Hardware`, `Digital Design`).
- **Media Frame**:
  - 16:9 ratio container with `object-fit: cover` or `contain` (as appropriate), subtle border, and hover scale/brightness transition.
- **Card Content**:
  - Subtitle in high-contrast text.
  - 2-sentence concise summary.
  - Preview tags for top 3-4 technologies.
  - Bottom actions: "View Project Gallery ↗" (triggers modal) and "GitHub / Repo" link.
- Entire card is clickable to open modal for high-usability experience.

### 3.2 Modal Dialog Viewer (`snadol.com` Inspired)
- **Overlay & Container**:
  - Fixed backdrop with blur (`backdrop-filter: blur(8px)`) and smooth fade-in.
  - Centered dialog container with max-width `900px`, max-height `90vh`, scrollable content body, and sticky header/footer.
  - Body scroll lock when modal is open.
- **Top Header**:
  - Category eyebrow.
  - Project Title + Year + Role.
  - Action buttons (`GitHub ↗`, `Live Demo ↗`).
  - Close button (`✕`) with clear hit target.
- **Multi-Image Gallery**:
  - **Featured View**: High-resolution image preview with smooth crossfade and caption pill.
  - **Thumbnail Strip**: Horizontal row of clickable thumbnails for all project images with active ring indicator.
  - **Click-to-Zoom Lightbox**: Clicking the featured preview opens full-screen lightbox for inspectable detail.
- **Overview & Highlights**:
  - Section title `Overview` and 1–2 sentence summary.
  - `▹` bullet highlights focusing on quantitative engineering results.
- **Skills Badge Clusters**:
  - Grouped into three distinct pill sections:
    - 🟣 **Languages**
    - 🔵 **Technologies / Hardware**
    - 🟢 **Protocols & Peripherals**
- **Modal Navigation**:
  - Previous Project and Next Project buttons in footer.
  - Keyboard listeners:
    - <kbd>Esc</kbd> closes modal / lightbox.
    - <kbd>→</kbd> / <kbd>←</kbd> navigates images (or projects).

---

## 4. Assets & Styling Implementation

### 4.1 New Image Assets
- Copy user-provided wand photos:
  - `C:\Users\aman\Downloads\PXL_20251213_200656652.jpg` → `assets/images/wand_pcb_1.jpg`
  - `C:\Users\aman\Downloads\PXL_20251213_200640646.jpg` → `assets/images/wand_pcb_2.jpg`

### 4.2 Styling Updates in `assets/css/style.scss`
- Variables: Utilize existing theme variables (`--bg-color`, `--card-bg`, `--text-primary`, `--accent-color`, etc.) to guarantee seamless Light/Dark mode transitions.
- Classes:
  - `.termbar`, `.termbar-title`, `.termbar-badge`
  - `.project-modal-backdrop`, `.project-modal`
  - `.modal-gallery`, `.modal-main-img`, `.modal-thumbnails`, `.modal-thumb`
  - `.modal-highlights`, `.modal-highlight-item`
  - `.skills-cluster`, `.skills-cluster-title`, `.skills-pill-group`
  - `.modal-lightbox`

### 4.3 Script Integration in `_layouts/default.html`
- Vanilla JavaScript (zero dependencies).
- Projects data passed via `site.data.projects | jsonify` into a client-side lookup.
- Functions:
  - `openProjectModal(projectId)`
  - `closeProjectModal()`
  - `setModalImage(index)`
  - `nextProject()` / `prevProject()`
  - Full keyboard event handling (<kbd>Escape</kbd>, <kbd>ArrowLeft</kbd>, <kbd>ArrowRight</kbd>).

---

## 5. Verification Plan

1. **Jekyll Build & Static Verification**:
   - Verify YAML syntax in `_data/projects.yml`.
   - Verify image paths and asset existence.
   - Run Jekyll build/bundle command if available, or test static HTML output.
2. **Interactive UI Verification**:
   - Card click opens modal instantly with correct project data.
   - All 6 projects cycle correctly with Next/Previous buttons and arrow keys.
   - Images in the thumbnail strip switch cleanly on click.
   - Lightbox opens on clicking main image; closes on Esc or click-outside.
   - Dark/Light mode theme switching renders legible text, borders, and badge colors in both states.
   - PDF portfolio generator (`/print-portfolio/` and `print-portfolio.html`) remains completely functional.
