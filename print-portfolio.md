---
layout: default
title: Aman Katyal - Full Portfolio
permalink: /print-portfolio/
---

<!-- This header hides when printing -->
<div class="print-instruction">
    <p><strong>Step 1:</strong> Press <code>Ctrl + P</code> (or Cmd + P).</p>
    <p><strong>Step 2:</strong> Set "Margins" to "None" or "Minimum" in print settings.</p>
    <p><strong>Step 3:</strong> Save as PDF.</p>
    <hr>
</div>

<!-- AUTOMATION LOOP STARTS HERE -->
{% assign print_pages = site.pages | where: "printable", true | sort: "order" %}

{% for project in print_pages %}
    
    <!-- Force a page break before every new project -->
    <div class="page-break"></div>

    <!-- Inject the Title manually (because we stripped the header) -->
    <h1>{{ project.title }}</h1>
    
    <!-- Inject the content automatically -->
    {{ project.content }}

    <hr class="print-divider">

{% endfor %}
