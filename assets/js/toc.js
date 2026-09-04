(function () {
  'use strict';

  var CONTENT = '.markdown-body';
  var container = document.querySelector(CONTENT);
  if (!container) {
    return;
  }

  var headings = container.querySelectorAll('h2, h3, h4');
  var sidebar = document.getElementById('site-sidebar');
  var nav = document.getElementById('toc');
  var layout = document.querySelector('.layout');

  // Нет полноценного оглавления — прячем сайдбар целиком и снимаем
  // отступ под него у контента.
  if (headings.length < 2) {
    if (sidebar) {
      sidebar.classList.add('is-hidden');
    }
    if (layout) {
      layout.classList.add('no-sidebar');
    }
    return;
  }

  // Привязываем якоря (anchor-js может быть не подключён) и добиваемся, чтобы у
  // каждого заголовка был id, используемый и ссылкой в оглавлении. Пустая иконка,
  // чтобы в текст пунктов оглавления не попадал символ '#'
  if (window.anchors) {
    window.anchors.options = window.anchors.options || {};
    window.anchors.options.icon = '';
    window.anchors.add(CONTENT + ' h2, ' + CONTENT + ' h3, ' + CONTENT + ' h4');
  }

  function slugify(text) {
    return text
      .trim()
      .toLowerCase()
      .replace(/[`~!@#$%^&*()|+=?;:'",.<>{}[\]\\/]/g, '')
      .replace(/_/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  var used = {};
  [].forEach.call(headings, function (h) {
    if (!h.id) {
      var base = slugify(h.textContent) || 'section';
      var id = base;
      var n = 1;
      while (used[id]) {
        id = base + '-' + (++n);
      }
      used[id] = true;
      h.id = id;
    }
  });

  var levels = { H2: 0, H3: 1, H4: 2 };
  var root = document.createElement('ul');
  var lists = [root]; // список для каждого уровня вложенности
  nav.appendChild(root);

  if (layout) {
    layout.classList.remove('no-sidebar');
  }

  [].forEach.call(headings, function (h) {
    var level = levels[h.tagName];
    lists.splice(level + 1);

    var li = document.createElement('li');
    li.className = 'toc-' + (level + 1);

    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent.trim();
    li.appendChild(a);

    (lists[level] || root).appendChild(li);

    var sub = document.createElement('ul');
    li.appendChild(sub);
    lists[level + 1] = sub;
  });
})();