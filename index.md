---
layout: default
title: Aman Katyal | Portfolio
---

<!-- Profile Hero Section -->
<div class="profile-hero">
  <h1 class="profile-name">Aman Katyal</h1>
  <p class="profile-tagline">Computer Engineering @ Purdue University</p>
  
  <div class="profile-meta-info">
    <span class="profile-meta-item">
      <i class="fa-solid fa-graduation-cap"></i> GPA: 3.94 / 4.0
    </span>
    <span class="profile-meta-item">
      <i class="fa-solid fa-location-dot"></i> West Lafayette, IN
    </span>
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
    <a href="https://linkedin.com/in/aman-katyal" target="_blank" rel="noopener noreferrer" class="profile-link-btn" title="LinkedIn">
      <i class="fa-brands fa-linkedin"></i> LinkedIn
    </a>
    <a href="https://github.com/itsamankatyal" target="_blank" rel="noopener noreferrer" class="profile-link-btn" title="GitHub">
      <i class="fa-brands fa-github"></i> GitHub
    </a>
    <a href="{{ '/print-portfolio/' | relative_url }}" class="profile-link-btn" title="PDF Portfolio">
      <i class="fa-solid fa-file-pdf"></i> PDF Portfolio
    </a>
  </div>

  <div class="profile-bio-card">
    <p>
      I am a Computer Engineering student at Purdue University specializing in the intersection of hardware architecture and verification. My experience ranges from UVM-based silicon verification for tape-out ready chips to high-speed PCB design and low-latency embedded firmware for robotic control systems. I am passionate about constructing robust, highly optimized, and mathematically verified hardware systems.
    </p>
  </div>
</div>

<!-- Projects Section -->
<div class="projects-section" id="projects">
  <h2 class="section-title">Featured Projects</h2>
  
  <div class="projects-grid">
    {% for project in site.data.projects %}
      {% assign featured_image = project.images | where: "featured", true | first | default: project.images.first %}
      <article class="project-card" data-project-trigger="{{ project.id }}" aria-label="Open details for {{ project.title }}">
        <!-- Terminal Header Bar (thavlik.dev style) -->
        <div class="termbar">
          <span class="termbar-title" title="{{ project.title }}">{{ project.title }}</span>
          <span class="termbar-badge" title="{{ project.badge_type | default: project.category }}">{{ project.badge_type | default: project.category }}</span>
        </div>

        <!-- Media Frame -->
        {% if featured_image %}
          <div class="project-card-media">
            <img src="{{ featured_image.src | relative_url }}" alt="{{ featured_image.label | default: project.title }}" loading="lazy">
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