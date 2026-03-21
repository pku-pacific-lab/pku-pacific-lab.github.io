// ===== Scroll Animations =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up, .fade-left, .fade-right, .stagger').forEach(el => {
  observer.observe(el);
});

function observeAnimations() {
  document.querySelectorAll('.fade-up, .fade-left, .fade-right, .stagger').forEach(el => {
    observer.observe(el);
  });
}

// ===== Navbar Scroll =====
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
  if (backToTop) backToTop.classList.toggle('show', window.scrollY > 300);
});

// ===== Mobile Menu =====
function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}

// ===== Email Obfuscation =====
function revealEmail(el) {
  const u = 'tianyuj';
  const d = 'pku.edu.cn';
  const addr = u + '@' + d;
  window.location.href = 'mail' + 'to:' + addr;
}

function getEmailText() {
  return 'tianyuj' + ' [at] ' + 'pku [dot] edu [dot] cn';
}

// ===== CSV Parser =====
function parseCSV(text) {
  var lines = text.split('\n').filter(function(l) { return l.trim(); });
  if (lines.length < 2) return [];

  function parseLine(line) {
    var fields = [];
    var i = 0, field = '', inQ = false;
    while (i < line.length) {
      var c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQ = !inQ; i++; continue;
      }
      if (c === ',' && !inQ) { fields.push(field); field = ''; i++; continue; }
      field += c; i++;
    }
    fields.push(field);
    return fields;
  }

  var headers = parseLine(lines[0]);
  return lines.slice(1).map(function(line) {
    var v = parseLine(line);
    var o = {};
    headers.forEach(function(h, i) { o[h.trim()] = (v[i] || '').trim(); });
    return o;
  });
}

// ===== HTML Escape =====
function escapeHTML(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ===== Render: Publications =====
function renderPublications(data) {
  var groups = {};
  data.forEach(function(pub) {
    var y = parseInt(pub.year) <= 2020 ? 'before' : pub.year;
    if (!groups[y]) groups[y] = [];
    groups[y].push(pub);
  });

  var years = Object.keys(groups).sort(function(a, b) {
    if (a === 'before') return 1;
    if (b === 'before') return -1;
    return parseInt(b) - parseInt(a);
  });

  var tabsEl = document.getElementById('pub-year-tabs');
  var contentEl = document.getElementById('pub-content');
  if (!tabsEl || !contentEl) return;

  tabsEl.innerHTML = years.map(function(y) {
    return '<button class="year-tab" data-year="' + y + '">' +
      (y === 'before' ? '2020 &amp; Before' : y) + '</button>';
  }).join('');

  contentEl.innerHTML = years.map(function(y) {
    var items = groups[y].map(function(pub) {
      var authors = escapeHTML(pub.authors);
      authors = authors.replace(/(Tianyu Jia[*†]*)/g, '<strong>$1</strong>');
      var award = pub.award ? '<span class="award-badge">' + escapeHTML(pub.award) + '</span>' : '';
      var tierClass = pub.type === 'journal' ? 'journal' : 'conference';
      var title = escapeHTML(pub.title);
      if (pub.link && pub.link.trim()) {
        title = '<a href="' + escapeHTML(pub.link.trim()) + '" target="_blank" class="pub-link">' + title + '</a>';
      }
      return '<div class="pub-item">' +
        '<span class="pub-venue ' + tierClass + '">' + escapeHTML(pub.venue) + '</span>' +
        award +
        '<span class="pub-text">' + authors + ', ' + title + ', <em>' + escapeHTML(pub.journal) + '</em>, ' + escapeHTML(pub.date) + '.</span>' +
        '</div>';
    }).join('\n');

    var label = y === 'before' ? '2020 &amp; Before' : y;
    return '<div class="pub-year-section" id="pub-year-' + y + '" data-year="' + y + '">' +
      '<h3 class="pub-year-heading">' + label + '</h3>' +
      '<div class="space-y stagger">' + items + '</div></div>';
  }).join('\n');

  initPubTabs();
  observeAnimations();
}

// ===== Render: News =====
function renderNews(data) {
  var container = document.getElementById('news-container');
  if (!container) return;

  container.innerHTML = data.map(function(item) {
    var typeClass = item.type === 'award' ? ' award' : '';
    var awardBadge = item.type === 'award' ? '<span class="award-badge">Award</span> ' : '';
    var imageHTML = (item.image && item.image.trim())
      ? '<img class="news-image" src="assets/images/' + encodeURIComponent(item.image.trim()) + '" alt="' + escapeHTML(item.title) + '">'
      : '';
    return '<div class="news-item' + typeClass + '">' +
      '<span class="news-date">' + escapeHTML(item.date) + '</span>' +
      '<h3 class="news-title">' + awardBadge + escapeHTML(item.title) + '</h3>' +
      '<p class="news-desc">' + escapeHTML(item.description) + '</p>' +
      imageHTML +
      '</div>';
  }).join('\n');

  observeAnimations();
}

// ===== Render: Students =====
function renderStudents(data) {
  var currentEl = document.getElementById('current-students');
  var masterEl = document.getElementById('master-students');
  var incomingEl = document.getElementById('incoming-students');
  var gradEl = document.getElementById('graduated-students');
  var incomingMasterEl = document.getElementById('incoming-master-students');
  var undergradEl = document.getElementById('undergrad-students');
  if (!currentEl || !gradEl) return;

  var current = data.filter(function(s) { return s.status.toLowerCase() === 'current'; });
  var master = data.filter(function(s) { return s.status.toLowerCase() === 'master'; });
  var incoming = data.filter(function(s) { return s.status.toLowerCase() === 'incoming'; });
  var incomingMaster = data.filter(function(s) { return s.status.toLowerCase() === 'incoming_master'; });
  var graduated = data.filter(function(s) { return s.status.toLowerCase() === 'graduated'; });
  var undergrad = data.filter(function(s) { return s.status.toLowerCase() === 'undergrad'; });

  var placeholder = '<div class="student-avatar">' +
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>' +
    '<circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>' +
    '</svg></div>';

  function cardHTML(s) {
    var photo = (s.photo && s.photo.trim())
      ? '<img class="student-photo" src="assets/images/team/' + encodeURIComponent(s.photo.trim()) + '" alt="' + escapeHTML(s.name) + '">'
      : placeholder;
    var tagline = (s.tagline && s.tagline.trim())
      ? '<p class="student-tagline">' + escapeHTML(s.tagline) + '</p>'
      : '';
    var link = 'member.html?name=' + encodeURIComponent(s.name.trim());
    var cnName = (s.name_cn && s.name_cn.trim())
      ? ' <span class="student-name-cn">' + escapeHTML(s.name_cn) + '</span>'
      : '';
    return '<a href="' + link + '" class="student-card">' +
      photo +
      '<div class="student-text">' +
      '<p class="student-name">' + escapeHTML(s.name) + cnName + '</p>' +
      '<p class="student-info">' + escapeHTML(s.info) + '</p>' +
      tagline +
      '</div></a>';
  }

  currentEl.innerHTML = current.map(cardHTML).join('\n');
  if (masterEl) masterEl.innerHTML = master.map(cardHTML).join('\n');
  if (incomingEl) incomingEl.innerHTML = incoming.map(cardHTML).join('\n');
  if (incomingMasterEl) incomingMasterEl.innerHTML = incomingMaster.map(cardHTML).join('\n');
  gradEl.innerHTML = graduated.map(cardHTML).join('\n');
  if (undergradEl) undergradEl.innerHTML = undergrad.map(cardHTML).join('\n');

  observeAnimations();
}

// ===== Render: Courses =====
function renderCourses(data) {
  var fallEl = document.getElementById('fall-courses');
  var springEl = document.getElementById('spring-courses');
  if (!fallEl || !springEl) return;

  var fall = data.filter(function(c) { return c.semester === 'Fall'; });
  var spring = data.filter(function(c) { return c.semester === 'Spring'; });

  function renderCards(courses) {
    return courses.map(function(c) {
      var badgeClass = c.level === 'Graduate' ? 'grad' : 'undergrad';
      return '<div class="course-card">' +
        '<span class="course-badge ' + badgeClass + '">' + escapeHTML(c.level) + '</span>' +
        '<p class="course-name">' + escapeHTML(c.name) + '</p>' +
        '</div>';
    }).join('\n');
  }

  fallEl.innerHTML = renderCards(fall);
  springEl.innerHTML = renderCards(spring);

  observeAnimations();
}

// ===== Publication Year Tabs =====
function initPubTabs() {
  var tabs = document.querySelectorAll('.year-tab');
  var sections = document.querySelectorAll('.pub-year-section');

  // Click tab → scroll to that year section
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var year = tab.getAttribute('data-year');
      var target = document.getElementById('pub-year-' + year);
      if (target) {
        var offset = document.querySelector('.year-tabs').offsetHeight + 70;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

  // Scroll → highlight the tab for the section currently in view
  function updateActiveTab() {
    var offset = document.querySelector('.year-tabs').offsetHeight + 80;
    var current = '';
    sections.forEach(function(section) {
      if (section.getBoundingClientRect().top <= offset) {
        current = section.getAttribute('data-year');
      }
    });
    if (current) {
      tabs.forEach(function(t) {
        t.classList.toggle('active', t.getAttribute('data-year') === current);
      });
    }
  }

  window.addEventListener('scroll', updateActiveTab, { passive: true });
  updateActiveTab();
}

if (document.querySelector('.year-tab')) {
  initPubTabs();
}

function renderChipGallery(data) {
  var container = document.getElementById('chip-gallery');
  if (!container) return;
  container.innerHTML = data.map(function(chip) {
    var img = escapeHTML(chip.image.trim());
    var label = escapeHTML(chip.label.trim());
    return '<div class="chip-item">' +
      '<img src="assets/images/chip_gallery/' + img + '" alt="' + label + '">' +
      '<p>' + label + '</p></div>';
  }).join('');
  observeAnimations();
}

// ===== Data Loading =====
document.addEventListener('DOMContentLoaded', function() {
  // Set email display text
  document.querySelectorAll('.email-text').forEach(function(el) {
    el.textContent = getEmailText();
  });

  // Load CSV data based on which page we're on
  if (document.getElementById('pub-content')) {
    fetch('data/publications.csv')
      .then(function(r) { return r.text(); })
      .then(function(text) { renderPublications(parseCSV(text)); })
      .catch(function() {
        document.getElementById('pub-content').innerHTML =
          '<p style="color:#a0aec0;margin-top:1rem;">Unable to load publications. Please serve the site via HTTP (e.g. python -m http.server).</p>';
      });
  }

  if (document.getElementById('news-container')) {
    fetch('data/news.csv')
      .then(function(r) { return r.text(); })
      .then(function(text) { renderNews(parseCSV(text)); })
      .catch(function() {
        document.getElementById('news-container').innerHTML =
          '<p style="color:#a0aec0;">Unable to load news.</p>';
      });
  }

  if (document.getElementById('current-students')) {
    fetch('data/students.csv')
      .then(function(r) { return r.text(); })
      .then(function(text) { renderStudents(parseCSV(text)); })
      .catch(function() {
        document.getElementById('current-students').innerHTML =
          '<p style="color:#a0aec0;">Unable to load team data.</p>';
      });
  }

  if (document.getElementById('fall-courses')) {
    fetch('data/courses.csv')
      .then(function(r) { return r.text(); })
      .then(function(text) { renderCourses(parseCSV(text)); })
      .catch(function() {
        document.getElementById('fall-courses').innerHTML =
          '<p style="color:#a0aec0;">Unable to load courses.</p>';
      });
  }

  if (document.getElementById('chip-gallery')) {
    fetch('data/chips.csv')
      .then(function(r) { return r.text(); })
      .then(function(text) { renderChipGallery(parseCSV(text)); })
      .catch(function() {
        document.getElementById('chip-gallery').innerHTML =
          '<p style="color:#a0aec0;">Unable to load chip gallery.</p>';
      });
  }

  // Member profile page
  if (document.getElementById('member-profile')) {
    var params = new URLSearchParams(window.location.search);
    var memberName = params.get('name');
    if (memberName) {
      Promise.all([
        fetch('data/students.csv').then(function(r) { return r.text(); }),
        fetch('data/publications.csv').then(function(r) { return r.text(); })
      ]).then(function(results) {
        var students = parseCSV(results[0]);
        var pubs = parseCSV(results[1]);
        renderMember(memberName, students, pubs);
      });
    } else {
      document.getElementById('member-profile').innerHTML =
        '<p style="color:var(--text-muted);margin-top:2rem;">No member specified. <a href="team.html">Back to Team</a></p>';
    }
  }
});

// ===== Render: Member Profile =====
function renderMember(name, students, pubs) {
  var profileEl = document.getElementById('member-profile');
  var pubsEl = document.getElementById('member-pubs');
  var breadcrumbEl = document.getElementById('breadcrumb-name');

  var member = students.find(function(s) { return s.name.trim() === name; });
  if (!member) {
    profileEl.innerHTML = '<p style="color:var(--text-muted);margin-top:2rem;">Member not found. <a href="team.html">Back to Team</a></p>';
    return;
  }

  // Update page title and breadcrumb
  document.title = escapeHTML(member.name) + ' - PACIFIC Lab';
  if (breadcrumbEl) breadcrumbEl.textContent = member.name;

  // Avatar placeholder
  var placeholder = '<div class="member-avatar">' +
    '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>' +
    '<circle cx="12" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>' +
    '</svg></div>';

  var photo = (member.photo && member.photo.trim())
    ? '<img class="member-photo" src="assets/images/team/' + encodeURIComponent(member.photo.trim()) + '" alt="' + escapeHTML(member.name) + '">'
    : placeholder;

  var statusMap = {
    'current': 'PhD Student',
    'master': 'Master Student',
    'incoming': 'Incoming PhD Student',
    'incoming_master': 'Incoming Master Student',
    'graduated': 'Alumni',
    'undergrad': 'Undergraduate Researcher'
  };
  var statusLabel = statusMap[member.status.toLowerCase()] || member.status;

  // Tags
  var tagsHTML = '';
  if (member.tags && member.tags.trim()) {
    var tags = member.tags.split(',');
    tagsHTML = '<div class="member-tags">' + tags.map(function(t) {
      return '<span class="member-tag">' + escapeHTML(t.trim()) + '</span>';
    }).join('') + '</div>';
  }

  // Bio
  var bioHTML = '';
  if (member.bio && member.bio.trim()) {
    bioHTML = '<div class="member-bio"><p>' + escapeHTML(member.bio) + '</p></div>';
  }

  // Tagline
  var taglineHTML = '';
  if (member.tagline && member.tagline.trim()) {
    taglineHTML = '<p class="member-tagline">"' + escapeHTML(member.tagline) + '"</p>';
  }

  profileEl.innerHTML =
    '<div class="member-header fade-up">' +
      '<div class="member-photo-wrap">' + photo + '</div>' +
      '<div class="member-info">' +
        '<p class="member-status">' + statusLabel + '</p>' +
        '<h1 class="member-name">' + escapeHTML(member.name) +
          ((member.name_cn && member.name_cn.trim()) ? ' <span class="member-name-cn">' + escapeHTML(member.name_cn) + '</span>' : '') +
        '</h1>' +
        '<p class="member-detail">' + escapeHTML(member.info) + '</p>' +
        taglineHTML +
        tagsHTML +
      '</div>' +
    '</div>' +
    bioHTML;

  // Filter publications by this member's name
  var firstName = name.split(' ')[0];
  var lastName = name.split(' ').slice(-1)[0];
  var memberPubs = pubs.filter(function(pub) {
    var authors = pub.authors || '';
    // Match "FirstName LastName" or "F. LastName" patterns
    return authors.indexOf(lastName) !== -1 && authors.indexOf(firstName) !== -1;
  });

  if (memberPubs.length > 0) {
    var pubItems = memberPubs.map(function(pub) {
      var authors = escapeHTML(pub.authors);
      authors = authors.replace(/(Tianyu Jia[*†]*)/g, '<strong>$1</strong>');
      // Also highlight the member's own name
      var namePattern = new RegExp('(' + escapeRegex(name) + ')', 'g');
      authors = authors.replace(namePattern, '<strong>$1</strong>');
      var tierClass = pub.type === 'journal' ? 'journal' : 'conference';
      var award = pub.award ? '<span class="award-badge">' + escapeHTML(pub.award) + '</span>' : '';
      var title = escapeHTML(pub.title);
      if (pub.link && pub.link.trim()) {
        title = '<a href="' + escapeHTML(pub.link.trim()) + '" target="_blank" class="pub-link">' + title + '</a>';
      }
      return '<div class="pub-item">' +
        '<span class="pub-venue ' + tierClass + '">' + escapeHTML(pub.venue) + '</span>' +
        award +
        '<span class="pub-text">' + authors + ', ' + title + ', <em>' + escapeHTML(pub.journal) + '</em>, ' + escapeHTML(pub.date) + '.</span>' +
        '</div>';
    }).join('\n');

    pubsEl.innerHTML =
      '<div class="fade-up">' +
        '<h2 class="section-title" style="font-size:1.4rem;">Publications</h2>' +
        '<p style="color:var(--text-muted);font-size:0.82rem;margin-bottom:1.25rem;">' + memberPubs.length + ' paper' + (memberPubs.length > 1 ? 's' : '') + ' as co-author</p>' +
        '<div class="space-y">' + pubItems + '</div>' +
      '</div>';
  }

  observeAnimations();
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
