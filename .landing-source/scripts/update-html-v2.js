import fs from 'fs';

const mapSvg = fs.readFileSync('assets/nigeria-map.svg', 'utf8').trim();

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EdTech Nigeria Landing Page</title>
    <meta name="description" content="An edtech platform landing page built with HTML, CSS, and vanilla JavaScript." />
    <meta property="og:title" content="EdTech Nigeria Landing Page" />
    <meta property="og:description" content="An edtech platform landing page built with HTML, CSS, and vanilla JavaScript." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    
    <!-- Google Fonts: Fredoka (500, 600, 700) & Nunito (400, 600, 700) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <!-- FIXED TOP NAVBAR -->
    <header class="navbar" id="navbar">
      <div class="navbar-container">
        <!-- Left: Platform Name -->
        <a href="#hero" class="nav-brand">[PLATFORM NAME]</a>
        
        <!-- Center: Nav Links (desktop) -->
        <nav class="nav-links" id="navLinks">
          <a href="#map-story" class="nav-link">[NAV LINK 1]</a>
          <a href="#screenshots" class="nav-link">[NAV LINK 2]</a>
          <a href="#exams" class="nav-link">[NAV LINK 3]</a>
          <a href="#blog" class="nav-link">[NAV LINK 4]</a>
        </nav>

        <!-- Right: Primary Action Button (desktop) -->
        <div class="nav-action">
          <a href="#cta" class="nav-button">[NAV BUTTON TEXT]</a>
        </div>

        <!-- Mobile Hamburger (under 768px) -->
        <button type="button" class="nav-hamburger" id="navHamburger" aria-label="Toggle menu" aria-expanded="false">
          <svg class="hamburger-svg" viewBox="0 0 24 24" width="24" height="24">
            <line class="h-line h-line-1" x1="4" y1="8" x2="20" y2="8" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
            <line class="h-line h-line-2" x1="4" y1="16" x2="20" y2="16" stroke="#0F172A" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Mobile Full-Width Panel -->
      <div class="nav-mobile-panel" id="navMobilePanel" aria-hidden="true">
        <nav class="nav-mobile-menu">
          <a href="#map-story" class="nav-mobile-link" style="--m-idx: 0;">[NAV LINK 1]</a>
          <a href="#screenshots" class="nav-mobile-link" style="--m-idx: 1;">[NAV LINK 2]</a>
          <a href="#exams" class="nav-mobile-link" style="--m-idx: 2;">[NAV LINK 3]</a>
          <a href="#blog" class="nav-mobile-link" style="--m-idx: 3;">[NAV LINK 4]</a>
          <a href="#cta" class="nav-mobile-btn" style="--m-idx: 4;">[NAV BUTTON TEXT]</a>
        </nav>
      </div>
    </header>

    <!-- SECTION 1: HERO -->
    <section class="section section-hero" id="hero">
      <div class="hero-header-wrap">
        <h1 class="hero-headline" id="heroHeadline">[HERO HEADLINE]</h1>
      </div>

      <!-- Hero Open Field with Continuous Ground Plane & 3 Depth Layers -->
      <div class="hero-field-wrapper">
        <!-- Continuous Ground Plane blending into section background -->
        <div class="hero-ground-plane" aria-hidden="true"></div>

        <div class="hero-students-field" id="heroStudentsField">
          <!-- BACK LAYER (Layer 1: Smaller, set back, soft ground shadow) -->
          <div class="hero-student-item student-pos-4 depth-back" data-depth="0.05" style="--idle-dur: 8.4s; --idle-delay: 0.2s;">
            <img src="/assets/student-4.png" alt="Nigerian boy sitting against tree trunk reading tablet" class="student-img" />
            <div class="student-shadow"></div>
          </div>
          <div class="hero-student-item student-pos-7 depth-back" data-depth="0.06" style="--idle-dur: 7.2s; --idle-delay: 0.6s;">
            <img src="/assets/student-7.png" alt="Nigerian girl lying on back reading book held in air" class="student-img" />
            <div class="student-shadow"></div>
          </div>
          <div class="hero-student-item student-pos-10 depth-back" data-depth="0.05" style="--idle-dur: 8.8s; --idle-delay: 0.4s;">
            <img src="/assets/student-10.png" alt="Nigerian boy standing reading book while walking" class="student-img" />
            <div class="student-shadow"></div>
          </div>
          <div class="hero-student-item student-pos-12 depth-back" data-depth="0.06" style="--idle-dur: 7.6s; --idle-delay: 0.9s;">
            <img src="/assets/student-12.png" alt="Nigerian boy kneeling solving math on whiteboard" class="student-img" />
            <div class="student-shadow"></div>
          </div>

          <!-- MID LAYER (Layer 2: Medium scale, mid field) -->
          <div class="hero-student-item student-pos-3 depth-mid" data-depth="0.08" style="--idle-dur: 6.8s; --idle-delay: 0.3s;">
            <img src="/assets/student-3.png" alt="Nigerian girl sitting on stack of books writing in notebook" class="student-img" />
            <div class="student-shadow"></div>
          </div>
          <div class="hero-student-item student-pos-5 depth-mid" data-depth="0.09" style="--idle-dur: 7.0s; --idle-delay: 0.7s;">
            <img src="/assets/student-5.png" alt="Nigerian girl standing holding open book close to face" class="student-img" />
            <div class="student-shadow"></div>
          </div>
          <div class="hero-student-item student-pos-9 depth-mid" data-depth="0.08" style="--idle-dur: 6.4s; --idle-delay: 1.1s;">
            <img src="/assets/student-9.png" alt="Nigerian girl sketching in sketchbook on low wall" class="student-img" />
            <div class="student-shadow"></div>
          </div>
          <div class="hero-student-item student-pos-11 depth-mid" data-depth="0.09" style="--idle-dur: 8.1s; --idle-delay: 0.5s;">
            <img src="/assets/student-11.png" alt="Nigerian girl sitting on floor surrounded by books highlighting" class="student-img" />
            <div class="student-shadow"></div>
          </div>

          <!-- FRONT LAYER (Layer 3: Forefront, largest, rich detail) -->
          <div class="hero-student-item student-pos-1 depth-front" data-depth="0.12" style="--idle-dur: 6.0s; --idle-delay: 0.1s;">
            <img src="/assets/student-1.png" alt="Nigerian girl sitting cross-legged reading thick book" class="student-img" />
            <div class="student-shadow"></div>
          </div>
          <div class="hero-student-item student-pos-2 depth-front" data-depth="0.13" style="--idle-dur: 7.5s; --idle-delay: 0.4s;">
            <img src="/assets/student-2.png" alt="Nigerian boy lying on stomach reading feet in air" class="student-img" />
            <div class="student-shadow"></div>
          </div>
          <div class="hero-student-item student-pos-6 depth-front" data-depth="0.14" style="--idle-dur: 6.6s; --idle-delay: 0.8s;">
            <img src="/assets/student-6.png" alt="Nigerian boy sitting on ground painting on easel" class="student-img" />
            <div class="student-shadow"></div>
          </div>
          <div class="hero-student-item student-pos-8 depth-front" data-depth="0.13" style="--idle-dur: 8.0s; --idle-delay: 1.0s;">
            <img src="/assets/student-8.png" alt="Nigerian boy sitting on bean bag with laptop" class="student-img" />
            <div class="student-shadow"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Wave Divider 1 -> 2 (Hero ground plane flows into Section 2) -->
    <div class="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0,32 C360,78 720,8 1080,48 C1260,68 1380,40 1440,32 L1440,80 L0,80 Z" fill="#FDFBF7"/>
      </svg>
    </div>

    <!-- SECTION 2: MAP + PROBLEM / SOLUTION -->
    <section class="section section-map-story" id="map-story">
      <div class="section-container map-story-grid">
        <!-- Left: giant inline SVG map with 3D low-angle transform & students supporting it overhead (55% width) -->
        <div class="map-stage js-reveal-map">
          <div class="map-3d-scene">
            <div class="map-floating-element">
              <!-- Inline SVG with 36 states + FCT from real geoBoundaries data -->
              ${mapSvg}
              <!-- Faint flat offset shadow showing map floats -->
              <div class="map-ground-shadow" aria-hidden="true"></div>
            </div>
            <!-- Students illustration with real alpha PNG: 7 varied students seen from below, faces looking up, hands flat touching map underside with no gap -->
            <div class="map-students-support">
              <img src="/assets/map-students.png" alt="Group of Nigerian students seen from low camera angle looking up, hands flat touching underside of map of Nigeria" class="students-support-img" />
            </div>
          </div>
        </div>

        <!-- Right: problem & solution text blocks -->
        <div class="map-story-content js-reveal-group">
          <div class="story-block js-reveal-item">
            <h2 class="section-heading">[PROBLEM HEADING]</h2>
            <p class="story-text">[PROBLEM STATEMENT]</p>
          </div>
          <div class="story-block js-reveal-item">
            <h2 class="section-heading">[SOLUTION HEADING]</h2>
            <p class="story-text">[HOW THE PLATFORM SOLVES IT]</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Wave Divider 2 -> 3 -->
    <div class="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0,45 C280,10 640,75 1000,25 C1220,-5 1360,50 1440,45 L1440,80 L0,80 Z" fill="#F3F7F5"/>
      </svg>
    </div>

    <!-- SECTION 3: APP SCREENSHOTS (auto-scrolling) -->
    <section class="section section-screenshots" id="screenshots">
      <div class="section-container">
        <h2 class="section-heading text-center js-reveal-item">[SCREENSHOTS HEADING]</h2>
      </div>
      
      <!-- Full-bleed marquee track -->
      <div class="screenshots-track-wrapper" id="screenshotsTrackWrapper">
        <div class="screenshots-track" id="screenshotsTrack">
          <!-- Set 1 (8 panels) -->
          <div class="screenshot-panel panel-odd"><img src="/assets/screenshot-1.png" alt="screenshot-1.png" class="screenshot-img" /></div>
          <div class="screenshot-panel panel-even"><img src="/assets/screenshot-2.png" alt="screenshot-2.png" class="screenshot-img" /></div>
          <div class="screenshot-panel panel-odd"><img src="/assets/screenshot-3.png" alt="screenshot-3.png" class="screenshot-img" /></div>
          <div class="screenshot-panel panel-even"><img src="/assets/screenshot-4.png" alt="screenshot-4.png" class="screenshot-img" /></div>
          <div class="screenshot-panel panel-odd"><img src="/assets/screenshot-5.png" alt="screenshot-5.png" class="screenshot-img" /></div>
          <div class="screenshot-panel panel-even"><img src="/assets/screenshot-6.png" alt="screenshot-6.png" class="screenshot-img" /></div>
          <div class="screenshot-panel panel-odd"><img src="/assets/screenshot-7.png" alt="screenshot-7.png" class="screenshot-img" /></div>
          <div class="screenshot-panel panel-even"><img src="/assets/screenshot-8.png" alt="screenshot-8.png" class="screenshot-img" /></div>
          <!-- Set 2 (duplicate for seamless loop) -->
          <div class="screenshot-panel panel-odd" aria-hidden="true"><img src="/assets/screenshot-1.png" alt="screenshot-1.png" class="screenshot-img" /></div>
          <div class="screenshot-panel panel-even" aria-hidden="true"><img src="/assets/screenshot-2.png" alt="screenshot-2.png" class="screenshot-img" /></div>
          <div class="screenshot-panel panel-odd" aria-hidden="true"><img src="/assets/screenshot-3.png" alt="screenshot-3.png" class="screenshot-img" /></div>
          <div class="screenshot-panel panel-even" aria-hidden="true"><img src="/assets/screenshot-4.png" alt="screenshot-4.png" class="screenshot-img" /></div>
          <div class="screenshot-panel panel-odd" aria-hidden="true"><img src="/assets/screenshot-1.png" alt="screenshot-5.png" class="screenshot-img" /></div>
          <div class="screenshot-panel panel-even" aria-hidden="true"><img src="/assets/screenshot-2.png" alt="screenshot-6.png" class="screenshot-img" /></div>
          <div class="screenshot-panel panel-odd" aria-hidden="true"><img src="/assets/screenshot-3.png" alt="screenshot-7.png" class="screenshot-img" /></div>
          <div class="screenshot-panel panel-even" aria-hidden="true"><img src="/assets/screenshot-4.png" alt="screenshot-8.png" class="screenshot-img" /></div>
        </div>
      </div>
    </section>

    <!-- Wave Divider 3 -> 4 -->
    <div class="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0,28 C420,70 760,10 1120,55 C1280,72 1390,35 1440,28 L1440,80 L0,80 Z" fill="#FFFDF4"/>
      </svg>
    </div>

    <!-- SECTION 4: SUPPORTED EXAMS -->
    <section class="section section-exams" id="exams">
      <div class="section-container">
        <div class="exams-header text-center js-reveal-item">
          <h2 class="section-heading">[EXAMS HEADING]</h2>
          <p class="exams-subtext">[EXAMS SUBTEXT]</p>
        </div>

        <div class="exams-grid" id="examsGrid">
          <!-- Cards generated strictly with [EXAM LIST] placeholder as specified -->
          <div class="exam-card exam-card-1 js-reveal-card">
            <h3 class="exam-name">[EXAM LIST]</h3>
            <p class="exam-desc">[EXAM DESCRIPTION]</p>
          </div>
          <div class="exam-card exam-card-2 js-reveal-card">
            <h3 class="exam-name">[EXAM LIST]</h3>
            <p class="exam-desc">[EXAM DESCRIPTION]</p>
          </div>
          <div class="exam-card exam-card-3 js-reveal-card">
            <h3 class="exam-name">[EXAM LIST]</h3>
            <p class="exam-desc">[EXAM DESCRIPTION]</p>
          </div>
          <div class="exam-card exam-card-4 js-reveal-card">
            <h3 class="exam-name">[EXAM LIST]</h3>
            <p class="exam-desc">[EXAM DESCRIPTION]</p>
          </div>
          <div class="exam-card exam-card-5 js-reveal-card">
            <h3 class="exam-name">[EXAM LIST]</h3>
            <p class="exam-desc">[EXAM DESCRIPTION]</p>
          </div>
          <div class="exam-card exam-card-6 js-reveal-card">
            <h3 class="exam-name">[EXAM LIST]</h3>
            <p class="exam-desc">[EXAM DESCRIPTION]</p>
          </div>
          <div class="exam-card exam-card-7 js-reveal-card">
            <h3 class="exam-name">[EXAM LIST]</h3>
            <p class="exam-desc">[EXAM DESCRIPTION]</p>
          </div>
          <div class="exam-card exam-card-8 js-reveal-card">
            <h3 class="exam-name">[EXAM LIST]</h3>
            <p class="exam-desc">[EXAM DESCRIPTION]</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Wave Divider 4 -> 5 -->
    <div class="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0,50 C320,15 700,78 1080,30 C1250,8 1380,55 1440,50 L1440,80 L0,80 Z" fill="#FFF9F5"/>
      </svg>
    </div>

    <!-- SECTION 5: BLOG CARDS -->
    <section class="section section-blog" id="blog">
      <div class="section-container">
        <h2 class="section-heading text-center js-reveal-item">[BLOG HEADING]</h2>
        <div class="blog-grid" id="blogGrid">
          <!-- Card 1 -->
          <a href="/blog/[POST-1-SLUG]" class="blog-card js-reveal-blog">
            <div class="blog-image-wrapper">
              <img src="/assets/blog-1.png" alt="Nigerian student studying with open textbooks and digital tablet" class="blog-illustration" />
            </div>
            <div class="blog-content">
              <h3 class="blog-title">[POST TITLE]</h3>
              <p class="blog-excerpt">[POST EXCERPT]</p>
            </div>
          </a>
          <!-- Card 2 -->
          <a href="/blog/[POST-2-SLUG]" class="blog-card js-reveal-blog">
            <div class="blog-image-wrapper">
              <img src="/assets/blog-2.png" alt="Nigerian student organizing exam timetable and checklist" class="blog-illustration" />
            </div>
            <div class="blog-content">
              <h3 class="blog-title">[POST TITLE]</h3>
              <p class="blog-excerpt">[POST EXCERPT]</p>
            </div>
          </a>
          <!-- Card 3 -->
          <a href="/blog/[POST-3-SLUG]" class="blog-card js-reveal-blog">
            <div class="blog-image-wrapper">
              <img src="/assets/blog-3.png" alt="Two Nigerian students collaborating around an interactive formula screen" class="blog-illustration" />
            </div>
            <div class="blog-content">
              <h3 class="blog-title">[POST TITLE]</h3>
              <p class="blog-excerpt">[POST EXCERPT]</p>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- Wave Divider 5 -> 6 -->
    <div class="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0,35 C380,75 740,12 1100,60 C1280,80 1390,38 1440,35 L1440,80 L0,80 Z" fill="#F8FAFC"/>
      </svg>
    </div>

    <!-- SECTION 6: COMPARISON TABLE (No vertical scroll on desktop, fixed column widths, all 7 rows visible) -->
    <section class="section section-comparison" id="comparison">
      <div class="section-container">
        <h2 class="section-heading text-center js-reveal-item">[COMPARISON HEADING]</h2>
        
        <div class="table-responsive-container js-reveal-table">
          <table class="comparison-table">
            <colgroup>
              <col class="col-feature" />
              <col class="col-platform" />
              <col class="col-others" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" class="th-feature">Feature</th>
                <th scope="col" class="th-platform">[PLATFORM NAME]</th>
                <th scope="col" class="th-others">Other platforms</th>
              </tr>
            </thead>
            <tbody>
              <tr class="table-row">
                <td class="td-feature">[FEATURE 1]</td>
                <td class="td-platform">
                  <svg class="table-check-icon" viewBox="0 0 24 24" aria-label="Included">
                    <path d="M5 13l4 4L19 7" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
                <td class="td-others">
                  <svg class="table-cross-icon" viewBox="0 0 24 24" aria-label="Not included">
                    <path d="M6 6l12 12M6 18L18 6" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
              </tr>
              <tr class="table-row">
                <td class="td-feature">[FEATURE 2]</td>
                <td class="td-platform">
                  <svg class="table-check-icon" viewBox="0 0 24 24" aria-label="Included">
                    <path d="M5 13l4 4L19 7" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
                <td class="td-others">
                  <svg class="table-cross-icon" viewBox="0 0 24 24" aria-label="Not included">
                    <path d="M6 6l12 12M6 18L18 6" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
              </tr>
              <tr class="table-row">
                <td class="td-feature">[FEATURE 3]</td>
                <td class="td-platform">
                  <svg class="table-check-icon" viewBox="0 0 24 24" aria-label="Included">
                    <path d="M5 13l4 4L19 7" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
                <td class="td-others">
                  <svg class="table-cross-icon" viewBox="0 0 24 24" aria-label="Not included">
                    <path d="M6 6l12 12M6 18L18 6" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
              </tr>
              <tr class="table-row">
                <td class="td-feature">[FEATURE 4]</td>
                <td class="td-platform">
                  <svg class="table-check-icon" viewBox="0 0 24 24" aria-label="Included">
                    <path d="M5 13l4 4L19 7" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
                <td class="td-others">
                  <svg class="table-cross-icon" viewBox="0 0 24 24" aria-label="Not included">
                    <path d="M6 6l12 12M6 18L18 6" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
              </tr>
              <tr class="table-row">
                <td class="td-feature">[FEATURE 5]</td>
                <td class="td-platform">
                  <svg class="table-check-icon" viewBox="0 0 24 24" aria-label="Included">
                    <path d="M5 13l4 4L19 7" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
                <td class="td-others">
                  <svg class="table-cross-icon" viewBox="0 0 24 24" aria-label="Not included">
                    <path d="M6 6l12 12M6 18L18 6" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
              </tr>
              <tr class="table-row">
                <td class="td-feature">[FEATURE 6]</td>
                <td class="td-platform">
                  <svg class="table-check-icon" viewBox="0 0 24 24" aria-label="Included">
                    <path d="M5 13l4 4L19 7" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
                <td class="td-others">
                  <svg class="table-cross-icon" viewBox="0 0 24 24" aria-label="Not included">
                    <path d="M6 6l12 12M6 18L18 6" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
              </tr>
              <tr class="table-row">
                <td class="td-feature">[FEATURE 7]</td>
                <td class="td-platform">
                  <svg class="table-check-icon" viewBox="0 0 24 24" aria-label="Included">
                    <path d="M5 13l4 4L19 7" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
                <td class="td-others">
                  <svg class="table-cross-icon" viewBox="0 0 24 24" aria-label="Not included">
                    <path d="M6 6l12 12M6 18L18 6" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Wave Divider 6 -> 7 -->
    <div class="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0,45 C340,10 700,75 1060,20 C1240,0 1370,52 1440,45 L1440,80 L0,80 Z" fill="#FFFBEB"/>
      </svg>
    </div>

    <!-- SECTION 7: CTA (minimal) -->
    <section class="section section-cta" id="cta">
      <div class="section-container cta-container js-reveal-item">
        <p class="cta-line">[CTA LINE]</p>
        <button type="button" class="cta-button">[CTA BUTTON TEXT]</button>
      </div>
    </section>

    <!-- Wave Divider 7 -> 8 -->
    <div class="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0,30 C360,70 720,15 1080,55 C1260,70 1380,35 1440,30 L1440,80 L0,80 Z" fill="#0F172A"/>
      </svg>
    </div>

    <!-- SECTION 8: FOOTER -->
    <footer class="section section-footer" id="footer">
      <div class="section-container footer-container">
        <div class="footer-top">
          <div class="footer-brand">[PLATFORM NAME]</div>
          <div class="footer-links">
            <a href="#hero" class="footer-link">[FOOTER LINK 1]</a>
            <a href="#map-story" class="footer-link">[FOOTER LINK 2]</a>
            <a href="#exams" class="footer-link">[FOOTER LINK 3]</a>
            <a href="#blog" class="footer-link">[FOOTER LINK 4]</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="footer-copyright">[COPYRIGHT LINE]</p>
        </div>
      </div>
    </footer>

    <script type="module" src="/script.js"></script>
  </body>
</html>
`;

fs.writeFileSync('index.html', html.trim());
console.log('Successfully updated index.html with new illustrations and placeholders!');
