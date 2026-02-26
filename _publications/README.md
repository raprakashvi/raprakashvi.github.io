# Publications Data Entry Guide

## Easy Format for Adding Publications

Simply copy and paste this template for each publication:

```liquid
{% include publication-card.html 
   title="Your Paper Title Here"
   authors="Author One, Author Two, Ravi Prakash, Author Four"
   venue="Conference or Journal Name"
   year="2024"
   figure="filename.png"
   figure_link="https://project-website.com"
   paper_url="https://arxiv.org/abs/xxxxx"
   website_url="https://project-website.com"
   venue_type="conference"
   tags="Robotics, Sensing, Learning" %}
```

## Parameters Explained

- **title**: Full paper title
- **authors**: Complete author list, comma-separated. Your name (Ravi Prakash) will be automatically highlighted
- **venue**: Conference or journal name
- **year**: Publication year
- **figure**: 
  - For local images/GIFs: Just the filename (e.g., `my-paper.png` or `my-paper.gif`)
  - Place files in `/images/publications/` folder
  - For YouTube videos: Full YouTube URL (e.g., `https://www.youtube.com/watch?v=xxxxx`)
- **figure_link**: URL where clicking the figure should go (project page, paper, etc.)
- **paper_url**: Required - Link to paper PDF or arXiv page
- **website_url**: Optional - Project website URL (shows "Website" tag if provided)
- **venue_type**: One of: `conference`, `journal`, `workshop`, or `arxiv`
- **tags**: 2-3 research areas, comma-separated (e.g., `"Robotics, Sensing, Learning"`)

## Tag Display Order

Tags appear in this order:
1. **Paper** (always shown, blue background)
2. **Website** (only if `website_url` is provided)
3. **Journal/Conference/Workshop/arXiv** (prominent, color-coded)
4. **Research tags** (2-3 smaller tags for research areas)

## Examples

### With Website
```liquid
{% include publication-card.html 
   title="My Awesome Paper"
   authors="Ravi Prakash, Co-Author Name"
   venue="ICML"
   year="2024"
   figure="my-paper.png"
   figure_link="https://my-project.com"
   paper_url="https://arxiv.org/abs/xxxxx"
   website_url="https://my-project.com"
   venue_type="conference"
   tags="Learning, Robotics" %}
```

### Without Website
```liquid
{% include publication-card.html 
   title="Another Paper"
   authors="Ravi Prakash, Other Author"
   venue="Nature"
   year="2024"
   figure="another-paper.gif"
   figure_link="https://arxiv.org/abs/xxxxx"
   paper_url="https://arxiv.org/abs/xxxxx"
   venue_type="journal"
   tags="Medical, Sensing" %}
```

### With YouTube Video
```liquid
{% include publication-card.html 
   title="Video Paper"
   authors="Ravi Prakash, Author"
   venue="CVPR"
   year="2024"
   figure="https://www.youtube.com/watch?v=xxxxx"
   figure_link="https://project.com"
   paper_url="https://arxiv.org/abs/xxxxx"
   website_url="https://project.com"
   venue_type="conference"
   tags="Vision, Learning" %}
```

