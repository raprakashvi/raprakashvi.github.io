---
layout: archive
title: "Publications and Presentations"
permalink: /publications/
---

{% include base_path %}

{% if author.googlescholar %}
  <p>You can also find my articles on <u><a href="{{author.googlescholar}}">my Google Scholar profile</a>.</u></p>
{% endif %}

<div class="publications-container">
  <h2>Publications</h2>
  
  {% comment %}
    Easy-to-use publication format:
    - title: Full paper title
    - authors: Complete author list (comma-separated, your name will be highlighted)
    - venue: Conference/journal name
    - year: Publication year
    - figure: Image/GIF filename (in /images/publications/) or YouTube URL
    - figure_link: Project website URL (clickable figure)
    - paper_url: Paper PDF/arXiv URL (required)
    - website_url: Project website URL (optional, shows "Website" tag)
    - venue_type: conference, journal, workshop, or arxiv
    - tags: 2-3 research areas (comma-separated, e.g., "Robotics, Sensing, Learning")
  {% endcomment %}
  
  {% include publication-card.html 
     title="See, Plan, Cut: MPC-Based Autonomous Volumetric Robotic Laser Surgery with OCT Guidance"
     authors="Ravi Prakash, Vincent Wang, et al."
     venue="arXiv"
     year="2024"
     figure="see-plan-cut.png"
     figure_link="https://see-plan-cut.github.io/"
     paper_url="https://arxiv.org/abs/2410.03152"
     website_url="https://see-plan-cut.github.io/"
     venue_type="arxiv"
     tags="Robotics, Sensing, Learning" %}
  
  {% include publication-card.html 
     title="Design and Evaluation of a Compliant Quasi Direct Drive End-effector for Safe Robotic Ultrasound Imaging"
     authors="D. Chen, Ravi Prakash, Z. Chen, S. Dias, V. Wang, L. Bridgeman, S. Oca"
     venue="arXiv"
     year="2024"
     paper_url="https://arxiv.org/abs/2410.03086"
     venue_type="arxiv"
     tags="Robotics, Medical" %}
  
  {% include publication-card.html 
     title="Extracting Critical Information from Unstructured Clinicians' Notes Data to Identify Dementia Severity Using a Rule-Based Approach: Feasibility Study"
     authors="Ravi Prakash, M. E. Dupre, T. Østbye, H. Xu"
     venue="JMIR Aging"
     year="2024"
     paper_url="https://aging.jmir.org/2024/1/e57926/"
     venue_type="journal"
     tags="Learning, Medical" %}
  
  {% include publication-card.html 
     title="A blinded study using laser induced endogenous fluorescence spectroscopy to differentiate ex vivo spine tumor, healthy muscle, and healthy bone"
     authors="J. Sperber, T.J. Zachem, Ravi Prakash, E. Owolo, K. Yamamoto, A.D. Nguyen, H. Hockenberry, W.A. Ross, J.E. Herndon, P.J. Codd, C.R. Goodwin"
     venue="Scientific Reports"
     year="2024"
     paper_url="https://www.nature.com/articles/s41598-023-50995-4"
     venue_type="journal"
     tags="Medical, Sensing" %}
  
  {% include publication-card.html 
     title="Computer Vision for Increased Operative Efficiency via Identification of Instruments in the Neurosurgical Operating Room: A Proof-of-Concept Study"
     authors="T.J. Zachem, S.F. Chen, V. Venkatraman, D.A. Sykes, Ravi Prakash, S. Spellicy, A.D. Suarez, W. Ross, P.J. Codd"
     venue="arXiv"
     year="2023"
     paper_url="https://arxiv.org/pdf/2312.03001.pdf"
     venue_type="arxiv"
     tags="Robotics, Learning" %}
  
  {% include publication-card.html 
     title="A Rule-Based Framework to Identify Severity of Dementia from Unstructured Electronic Health Record Data"
     authors="Ravi Prakash, M.E. Dupre, T. Ostbye, H. Xu"
     venue="Alzheimer's & Dementia"
     year="2023"
     venue_type="journal"
     tags="Learning, Medical" %}
  
  {% include publication-card.html 
     title="3D Laser-and-tissue Agnostic Data-driven Method for Robotic Laser Surgical Planning"
     authors="G. Ma, Ravi Prakash, B. Mann, W. Ross, P. Codd"
     venue="IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS)"
     year="2023"
     paper_url="https://arxiv.org/pdf/2305.01524.pdf"
     venue_type="conference"
     tags="Robotics, Learning" %}
  
  {% include publication-card.html 
     title="Brain-Mimicking Phantom for Photoablation and Visualization"
     authors="Ravi Prakash, K.K. Yamamoto, S.R. Oca, W. Ross, P.J. Codd"
     venue="International Symposium on Medical Robotics"
     year="2023"
     venue_type="conference"
     tags="Robotics, Medical" %}
  
  {% include publication-card.html 
     title="Optimization of Laser Photoablation for Robotic Soft-Tissue Surgery"
     authors="W. Ross, Ravi Prakash, G. Ma, W. Eward, B. Mann, W. Ross, P. Codd"
     venue="Workshop on Data vs Model in Medical Robotics (DMMR), IROS"
     year="2023"
     venue_type="workshop"
     tags="Robotics, Medical" %}
  
  {% include publication-card.html 
     title="Comparative study of fluid flow and heat transfer in microchannels with uniformly varying cross-section"
     authors="A. Chatterjee, R.K. Valaparla, Ravi Prakash, K. Balasubramanian"
     venue="Emerging Trends in Mechanical Engineering"
     year="2019"
     venue_type="conference"
     tags="Engineering" %}
  
</div>

<h2>Presentations</h2>

<div class="publications-container">
  {% comment %} Presentations can be added here if needed {% endcomment %}
</div>
