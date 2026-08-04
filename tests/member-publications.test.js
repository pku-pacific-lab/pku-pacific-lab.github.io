const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('assets/js/main.js', 'utf8');

function renderPublicationsFor(authors, title) {
  const elements = {
    'member-profile': { innerHTML: '' },
    'member-pubs': { innerHTML: '' },
    'breadcrumb-name': { textContent: '' }
  };
  const context = {
    console,
    document: {
      addEventListener: function() {},
      getElementById: function(id) { return elements[id] || null; },
      querySelector: function() { return null; },
      querySelectorAll: function() { return []; },
      title: ''
    },
    window: {
      addEventListener: function() {},
      location: { search: '', href: '' },
      scrollY: 0
    },
    IntersectionObserver: function() {
      this.observe = function() {};
    },
    URLSearchParams,
    fetch: function() { throw new Error('Unexpected fetch'); }
  };

  vm.runInNewContext(source, context);
  context.renderMember('Keyi Ji', [{
    name: 'Keyi Ji',
    name_cn: '纪柯熠',
    status: 'master',
    info: 'Since 2027',
    photo: '',
    tagline: '',
    bio: '',
    tags: ''
  }], [{
    authors,
    title,
    type: 'conference',
    venue: 'TEST',
    journal: 'Test Conference',
    date: '2027',
    award: '',
    link: ''
  }]);

  return elements['member-pubs'].innerHTML;
}

assert.strictEqual(
  renderPublicationsFor('Keyi Li, Yifan Jia, Tianyu Jia*', 'Unrelated paper'),
  '',
  'names split across different authors must not match Keyi Ji'
);
assert.match(
  renderPublicationsFor('Keyi Ji†, Tianyu Jia*', 'Own paper'),
  /Own paper/,
  'an exact author name with a contribution marker must match'
);

console.log('Member publication matching tests passed.');
