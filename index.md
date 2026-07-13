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
    <a href="mailto:itsamankatyal@gmail.com" class="profile-link-btn" title="Email">
      <i class="fa-solid fa-envelope"></i> Email
    </a>
    <a href="https://linkedin.com/in/aman-katyal" target="_blank" rel="noopener noreferrer" class="profile-link-btn" title="LinkedIn">
      <i class="fa-brands fa-linkedin"></i> LinkedIn
    </a>
    <a href="https://github.com/itsamankatyal" target="_blank" rel="noopener noreferrer" class="profile-link-btn" title="GitHub">
      <i class="fa-brands fa-github"></i> GitHub
    </a>
  </div>

  <div class="profile-bio-card">
    <p>
      I am a Computer Engineering student at Purdue University specializing in the intersection of hardware architecture and verification. My experience ranges from UVM-based silicon verification for tape-out ready chips to high-speed PCB design and low-latency embedded firmware for robotic control systems. I am passionate about constructing robust, highly optimized, and mathematically verified hardware systems.
    </p>
  </div>
</div>

<!-- Projects Section -->
<div class="projects-section">
  <h2 class="section-title">Featured Projects</h2>
  
  <div class="projects-grid">
    {% assign sorted_projects = site.pages | where_exp: "item", "item.permalink contains '/projects/'" | sort: "order" %}
    {% for project in sorted_projects %}
      <a href="{{ project.url | relative_url }}" class="project-card">
        {% if project.image %}
          <div class="project-card-image">
            <img src="{{ project.image | relative_url }}" alt="{{ project.title }}">
          </div>
        {% endif %}
        <div class="project-card-header">
          <span class="project-card-tag">{{ project.role | default: "Project" }}</span>
          <h3 class="project-card-title">{{ project.title }}</h3>
          <p class="project-card-desc">{{ project.description }}</p>
        </div>
        <div class="project-card-tech">
          {% for tech in project.technologies %}
            <span class="tech-badge">{{ tech }}</span>
          {% endfor %}
        </div>
      </a>
    {% endfor %}
  </div>
</div>