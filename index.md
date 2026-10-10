---
layout: default
title: Aman Katyal | Portfolio
---

<!-- Hero Section (name + education card) -->
<div class="hero-grid">
  <div class="hero-left">
    <h1 class="profile-name hero-name">Aman Katyal</h1>
    <p class="profile-tagline hero-tagline">Computer Engineering @ Purdue University · Fremont, CA</p>

    <div class="hero-ctas">
      <a href="#projects" class="hero-cta">view work →</a>
    </div>

    <div class="profile-links">
      <span class="email-display-group">
        <a href="mailto:{{ site.email }}" class="profile-link-btn email-address" title="Send an email">
          <i class="fa-solid fa-envelope"></i> <span class="email-address-text">{{ site.email }}</span>
        </a>
        <button type="button" class="email-copy-icon-btn" data-copy-email="{{ site.email }}" title="Copy email address" aria-label="Copy email address to clipboard">
          <i class="fa-regular fa-copy"></i>
        </button>
      </span>
      <a href="{{ site.linkedin }}" target="_blank" rel="noopener noreferrer" class="profile-link-btn" title="LinkedIn" data-proofer-ignore>
        <i class="fa-brands fa-linkedin"></i> LinkedIn
      </a>
      <a href="{{ site.github }}" target="_blank" rel="noopener noreferrer" class="profile-link-btn" title="GitHub">
        <i class="fa-brands fa-github"></i> GitHub
      </a>
      <a href="{{ site.resume | relative_url }}" target="_blank" rel="noopener noreferrer" class="profile-link-btn" title="Resume (PDF)">
        <i class="fa-solid fa-file-lines"></i> Resume
      </a>
    </div>
  </div>

  <aside class="edu-card" aria-label="Education">
    <span class="edu-eyebrow">Education</span>
    <h2 class="edu-school">Purdue University</h2>
    <p class="edu-degree">B.S. Computer Engineering</p>
    <p class="edu-years">Expected May 2027</p>
    <p class="edu-degree">M.S. Electrical & Computer Engineering</p>
    <p class="edu-years">Expected May 2028</p>
    <dl class="edu-rows">
      <div class="edu-row">
        <dt>gpa</dt>
        <dd>{{ site.gpa }}</dd>
      </div>
      <div class="edu-row">
        <dt>coursework</dt>
        <dd>RISC-V Microarchitecture, ASIC Design Flow, Embedded Microprocessor Systems</dd>
      </div>
      <div class="edu-row">
        <dt>honors</dt>
        <dd>Dean's List, Semester Honors</dd>
      </div>
    </dl>
  </aside>
</div>

<!-- Skills Section (aggregated across all projects) -->
{% assign lang_list = "" | split: "" %}
{% assign tech_list = "" | split: "" %}
{% assign proto_list = "" | split: "" %}
{% for p in site.data.projects %}
  {% for l in p.skills.languages %}{% assign lang_list = lang_list | push: l %}{% endfor %}
  {% for t in p.skills.technologies %}{% assign tech_list = tech_list | push: t %}{% endfor %}
  {% for r in p.skills.protocols %}{% assign proto_list = proto_list | push: r %}{% endfor %}
{% endfor %}
<div class="skills-section">
  <span class="skills-eyebrow">Skills</span>
  <div class="skills-grid">
    <div class="skills-col">
      <h3>languages</h3>
      <div class="skills-pills">
        {% assign langs = lang_list | uniq | sort %}
        {% for lang in langs %}<span class="skill-pill">{{ lang }}</span>{% endfor %}
      </div>
    </div>
    <div class="skills-col">
      <h3>technologies</h3>
      <div class="skills-pills">
        {% assign techs = tech_list | uniq | sort %}
        {% for tech in techs %}<span class="skill-pill">{{ tech }}</span>{% endfor %}
      </div>
    </div>
    <div class="skills-col">
      <h3>protocols / peripherals</h3>
      <div class="skills-pills">
        {% assign protos = proto_list | uniq | sort %}
        {% for proto in protos %}<span class="skill-pill">{{ proto }}</span>{% endfor %}
      </div>
    </div>
  </div>
</div>

<!-- Experience Section (follows resume) -->
<div class="exp-section" id="experience">
  <span class="skills-eyebrow">Experience</span>
  <div class="exp-list">
    <div class="exp-entry">
      <div class="exp-head">
        <span class="exp-role">ASIC Intern — Hewlett Packard Enterprise</span>
        <span class="exp-meta">Roseville, CA · May 2026 – Aug 2026</span>
      </div>
      <ul class="exp-bullets">
        <li><span class="highlight-bullet">▹</span><span>Rebuilt an internal microcode compilation pipeline in Python with a defined grammar, AST validator, and CLI toolchain targeting on-chip instructions.</span></li>
        <li><span class="highlight-bullet">▹</span><span>Built a pre-silicon log ingestion engine that parses 10 GB of simulation traces in under 2 minutes, plus a dashboard tracking RTL commits to speed up post-failure triage.</span></li>
      </ul>
    </div>
    <div class="exp-entry">
      <div class="exp-head">
        <span class="exp-role">Undergraduate ASIC Researcher — Purdue SoCET</span>
        <span class="exp-meta">Aug 2025 – Present</span>
      </div>
      <ul class="exp-bullets">
        <li><span class="highlight-bullet">▹</span><span>Profile compiler-generated kernel assembly against hand-written benchmarks for an AI accelerator; develop VLIW packetization and software pipelining passes.</span></li>
        <li><span class="highlight-bullet">▹</span><span>Ported TinyUSB to a custom RISC-V SoC as a bare-metal USB host controller driver, validated through Verilator co-simulation.</span></li>
      </ul>
    </div>
    <div class="exp-entry">
      <div class="exp-head">
        <span class="exp-role">Embedded Lead, Multi-Node Vehicle Network — Purdue IEEE ROV Team</span>
        <span class="exp-meta">May 2026 – Present</span>
      </div>
      <ul class="exp-bullets">
        <li><span class="highlight-bullet">▹</span><span>Migrated vehicle communication from point-to-point SPI to a multi-node CAN FD bus across 3 STM32 microcontrollers.</span></li>
        <li><span class="highlight-bullet">▹</span><span>Built a software-in-the-loop simulation dashboard to validate multi-node firmware telemetry and pilot controls before vehicle assembly.</span></li>
      </ul>
    </div>
  </div>
</div>

<!-- Projects Section -->
<div class="projects-section" id="projects">
  <h2 class="section-title">Featured Projects</h2>
  
  <div class="projects-grid">
    {% for project in site.data.projects %}
      {% assign featured_image = project.images | where: "featured", true | first | default: project.images.first %}
      <article class="project-card" data-project-trigger="{{ project.id }}" aria-label="Open details for {{ project.title }}">
        <!-- Terminal Header Bar: badge only (full title lives in the card heading) -->
        <div class="termbar">
          <span class="termbar-badge" title="{{ project.badge_type | default: project.category }}">{{ project.badge_type | default: project.category }}</span>
        </div>

        <!-- Media Frame -->
        {% if featured_image %}
          <div class="project-card-media">
            <img src="{{ featured_image.src | relative_url }}" alt="{{ featured_image.label | default: project.title }}" loading="lazy"{% if featured_image.position %} style="object-position: {{ featured_image.position }}"{% endif %}>
          </div>
        {% endif %}

        <!-- Card Body Content -->
        <div class="project-card-content">
          {% if project.subtitle %}
            <span class="project-card-subtitle">{{ project.subtitle }}</span>
          {% endif %}
          <h3 class="project-card-heading">{{ project.title }}</h3>
          <p class="project-card-desc">{{ project.summary }}</p>

          <!-- Technology Badges / Pills -->
          <div class="project-card-tech">
            {% for tech in project.skills.technologies limit:3 %}
              <span class="tech-badge">{{ tech }}</span>
            {% endfor %}
            {% for lang in project.skills.languages limit:2 %}
              <span class="tech-badge">{{ lang }}</span>
            {% endfor %}
            {% assign tech_total = project.skills.technologies.size | plus: project.skills.languages.size %}
            {% if tech_total > 5 %}
              <span class="tech-badge tech-badge-more" title="{{ project.skills.technologies | join: ', ' }}; {{ project.skills.languages | join: ', ' }}">+{{ tech_total | minus: 5 }} more</span>
            {% endif %}
          </div>

          <!-- Card Action Buttons -->
          <div class="project-card-actions">
            <button type="button" class="card-btn card-btn-primary" data-project-trigger="{{ project.id }}">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
              <span>Preview & Gallery</span>
            </button>
            {% if project.github %}
              <a href="{{ project.github }}" target="_blank" rel="noopener noreferrer" class="card-btn card-btn-secondary" aria-label="View {{ project.title }} on GitHub">
                <i class="fa-brands fa-github"></i>
                <span>GitHub</span>
              </a>
            {% endif %}
            {% if project.live %}
              <a href="{{ project.live | relative_url }}" class="card-btn card-btn-secondary" aria-label="View {{ project.title }} documentation">
                <i class="fa-solid fa-file-lines"></i>
                <span>Docs</span>
              </a>
            {% endif %}
          </div>
        </div>
      </article>
    {% endfor %}
  </div>
</div>