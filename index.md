---
layout: default
title: Aman Katyal | Portfolio
---

{% assign projects = "" | split: "" %}
{% for project_pair in site.data.projects %}
  {% assign projects = projects | push: project_pair[1] %}
{% endfor %}
{% assign projects = projects | sort: "order" %}

{% include home/hero.html %}
{% include home/skills.html %}
{% include home/experience.html %}
{% include home/projects.html %}
