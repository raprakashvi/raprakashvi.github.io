---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
---

{% if author.googlescholar %}
  <p>You can also find my articles on <u><a href="{{author.googlescholar}}">my Google Scholar profile</a>.</u></p>
{% endif %}

{% include base_path %}

<div class="publications-container">
  <h2>Publications</h2>
  
  {% comment %}
    Example publication entries - replace with your actual publications
    Each publication uses the publication-card include with the following parameters:
    - title: Publication title
    - authors: Author list (comma-separated)
    - venue: Conference/journal name
    - year: Publication year
    - figure: Image path (relative to /images/ or full URL)
    - figure_link: URL for clickable figure (project page)
    - paper_url: URL to paper (PDF/arXiv)
    - venue_type: conference, journal, workshop, or arxiv
    - tags: Comma-separated research area tags (e.g., "Robotics, Sensing, Learning")
  {% endcomment %}
  
  {% comment %} Example publication - replace with your actual publications {% endcomment %}
  {% include publication-card.html 
     title="See, Plan, Cut: MPC-Based Autonomous Volumetric Robotic Laser Surgery with OCT Guidance"
     authors="Ravi Prakash, Vincent Wang, et al."
     venue="arXiv"
     year="2024"
     figure="publications/see-plan-cut.png"
     figure_link="https://example.com/project"
     paper_url="https://arxiv.org/abs/2410.03152"
     venue_type="arxiv"
     tags="Robotics, Sensing, Learning" %}
  
  {% comment %} Add more publications below using the same format {% endcomment %}
  
</div>

<h2>Presentations</h2>

<div class="publications-container">
  {% comment %} Presentations can be added here if needed {% endcomment %}
</div>
