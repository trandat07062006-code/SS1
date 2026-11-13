/* Customique – studio (text, art, uploads), ready-made styles, cart, checkout, quote, menu */
(function () {
  'use strict';

  /* ---------- config ---------- */
  var BASE = { tee: 200000, shirt: 280000, hood: 440000, pants: 320000, jeans: 480000 }; // VND
  var LABEL = { tee: 'T-shirt', shirt: 'Shirt', hood: 'Hoodie', pants: 'Pants', jeans: 'Jeans' };
  var AREA = { tee: { x: 150, y: 122, w: 96 }, shirt: { x: 196, y: 118, w: 56 }, hood: { x: 150, y: 168, w: 96 },
               pants: { x: 114, y: 98, w: 52 }, jeans: { x: 114, y: 98, w: 52 } };
  var ARTS = { none: 'No graphic', skull: 'Skull', moon: 'Crescent moon', bolt: 'Lightning bolt', rose: 'Rose',
               mushroom: 'Mushroom', cross: 'Cross', star: 'Star' };
  var TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'], BOTTOM_SIZES = ['28', '30', '32', '34', '36', '38'];
  var FEE_TEXT = 20000, FEE_ART = 40000, FEE_UPLOAD = 60000;
  var SHIPPING = 30000, FREE_SHIP = 1000000, BULK_QTY = 10, BULK_OFF = 0.1;
  var COLORS = [
    { hex: '#8e1019', name: 'Dark red' }, { hex: '#ffffff', name: 'White' }, { hex: '#1c0d0e', name: 'Black' },
    { hex: '#d9363e', name: 'Red' },      { hex: '#f3d6d8', name: 'Pink' },  { hex: '#e9dfd2', name: 'Beige' },
    { hex: '#2d3f63', name: 'Denim blue' }, { hex: '#6b6b6b', name: 'Grey' }
  ];
  var STYLES = ['Alt', 'Gothic', 'Indie', 'Grunge', 'Minimal'];
  var DESIGNS = [
    { id: 'd1', name: 'Night Garden',  style: 'Gothic',  g: 'tee',   fabric: '#1c0d0e', ink: '#f3d6d8', art: 'rose',     text: 'nightbloom' },
    { id: 'd2', name: 'Grave Shift',   style: 'Gothic',  g: 'hood',  fabric: '#1c0d0e', ink: '#ffffff', art: 'skull',    text: 'grave shift' },
    { id: 'd3', name: 'Velvet Cross',  style: 'Gothic',  g: 'shirt', fabric: '#8e1019', ink: '#ffffff', art: 'cross',    text: '' },
    { id: 'd4', name: 'Soft Static',   style: 'Indie',   g: 'tee',   fabric: '#e9dfd2', ink: '#8e1019', art: 'mushroom', text: 'soft static' },
    { id: 'd5', name: 'Moonlit Walk',  style: 'Indie',   g: 'hood',  fabric: '#f3d6d8', ink: '#8e1019', art: 'moon',     text: 'moonlit' },
    { id: 'd6', name: 'Daisy Chain',   style: 'Indie',   g: 'jeans', fabric: '#2d3f63', ink: '#ffffff', art: 'rose',     text: '' },
    { id: 'd7', name: 'Overload',      style: 'Alt',     g: 'tee',   fabric: '#ffffff', ink: '#8e1019', art: 'bolt',     text: 'overload' },
    { id: 'd8', name: 'Hex Pants',     style: 'Alt',     g: 'pants', fabric: '#1c0d0e', ink: '#d9363e', art: 'star',     text: 'hex' },
    { id: 'd9', name: 'No Rules',      style: 'Grunge',  g: 'jeans', fabric: '#6b6b6b', ink: '#ffffff', art: 'skull',    text: 'no rules' },
    { id: 'd10', name: 'Plain Rebel',  style: 'Minimal', g: 'shirt', fabric: '#ffffff', ink: '#8e1019', art: 'none',     text: 'customique' }
  ];
  var STYLE_CLASS = { Alt: 'st-alt', Gothic: 'st-gothic', Indie: 'st-indie', Grunge: 'st-grunge', Minimal: 'st-minimal' };

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var money = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '₫'; };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var nameOf = function (hex) { for (var i = 0; i < COLORS.length; i++) if (COLORS[i].hex === hex) return COLORS[i].name; return hex; };
  var store = {
    get: function (k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  };
  var clampQty = function (v) { v = parseInt(v, 10); return isNaN(v) ? 1 : Math.max(1, Math.min(99, v)); };
  var validEmail = function (s) { return /^\S+@\S+\.\S+$/.test(s); };
  var isBottom = function (g) { return g === 'pants' || g === 'jeans'; };
  var hasArt = function (c) { return !!c.up || (c.art && c.art !== 'none'); };
  var describeArt = function (c) { return c.up ? 'your graphic' : (hasArt(c) ? ARTS[c.art].toLowerCase() : ''); };

  var toastTimer;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ---------- pricing ---------- */
  function unit(c) { return BASE[c.g] + (c.text ? FEE_TEXT : 0) + (c.up ? FEE_UPLOAD : (hasArt(c) ? FEE_ART : 0)); }

  /* ---------- garment scene (preview, cards, cart thumbnails) ---------- */
  function scene(c) {
    var a = AREA[c.g], s = (c.scale || 100) / 100, w = a.w * s, dy = c.dy || 0, text = (c.text || '').trim();
    var top = a.y - w / 2 - (text ? 10 : 0) + dy, out = '<g style="color:' + c.fabric + '"><use href="#g-' + c.g + '"/></g>';
    if (c.up) {
      out += '<image href="' + c.up + '" x="' + (a.x - w / 2) + '" y="' + top + '" width="' + w + '" height="' + w + '" preserveAspectRatio="xMidYMid meet"/>';
    } else if (c.art && ARTS[c.art] && c.art !== 'none') {
      out += '<use href="#a-' + c.art + '" x="' + (a.x - w / 2) + '" y="' + top + '" width="' + w + '" height="' + w + '" style="color:' + c.ink + '"/>';
    }
    if (text) {
      var fs = Math.max(8, Math.min(24, Math.round(a.w * 1.7 / Math.max(text.length, 4))));
      var ty = hasArt(c) ? top + w + 18 : a.y + dy + fs / 3;
      out += '<text x="' + a.x + '" y="' + ty + '" text-anchor="middle" font-family="Bricolage Grotesque, Arial Black, sans-serif" font-weight="800" font-size="' + fs + '" fill="' + c.ink + '">' + esc(text) + '</text>';
    }
    return out;
  }

  /* ---------- mobile menu ---------- */
  var nav = $('#nav'), burger = $('#burger');
  function setMenu(open) { nav.classList.toggle('open', open); burger.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* ---------- studio ---------- */
  var design = { g: 'tee', fabric: COLORS[0].hex, ink: '#ffffff', text: '', art: 'none', up: null, upName: '', scale: 100, dy: 0 };
  var prev = $('#preview'), garment = $('#garment'), txt = $('#txt'), artSel = $('#art'),
      sSize = $('#sSize'), sQty = $('#sQty'), gScale = $('#gScale'), gY = $('#gY');

  Object.keys(ARTS).forEach(function (k) {
    var o = document.createElement('option'); o.value = k; o.textContent = ARTS[k]; artSel.appendChild(o);
  });

  function setSizes(g, keep) {
    var list = isBottom(g) ? BOTTOM_SIZES : TOP_SIZES, def = isBottom(g) ? '32' : 'M';
    sSize.textContent = '';
    list.forEach(function (s) { var o = document.createElement('option'); o.value = o.textContent = s; sSize.appendChild(o); });
    sSize.value = list.indexOf(keep) >= 0 ? keep : def;
    if (typeof renderStudio === 'function' && prev) renderStudio();
  }

  function renderStudio() {
    design.text = txt.value.trim();
    prev.innerHTML = scene(design);
    $('#sPrice').textContent = money(unit(design) * clampQty(sQty.value));
    $('#sizeTag').textContent = LABEL[design.g] + ' · ' + (isBottom(design.g) ? 'waist ' : 'size ') + sSize.value + ' · qty ' + clampQty(sQty.value);
  }

  function buildSwatches(id, key) {
    var box = $('#' + id);
    COLORS.forEach(function (c) {
      var b = document.createElement('button');
      b.type = 'button'; b.style.background = c.hex; b.setAttribute('aria-label', c.name);
      b.addEventListener('click', function () { design[key] = c.hex; syncSwatches(); renderStudio(); });
      box.appendChild(b);
    });
  }
  function syncSwatches() {
    [['fab', 'fabric'], ['ink', 'ink']].forEach(function (p) {
      $$('#' + p[0] + ' button').forEach(function (b, i) {
        b.setAttribute('aria-pressed', COLORS[i].hex === design[p[1]] ? 'true' : 'false');
      });
    });
  }
  function syncUpload() {
    $('#upInfo').hidden = !design.up;
    $('#upName').textContent = design.up ? 'Using: ' + design.upName : '';
    artSel.disabled = !!design.up;
  }

  buildSwatches('fab', 'fabric'); buildSwatches('ink', 'ink');
  setSizes('tee'); syncSwatches(); syncUpload();

  sSize.addEventListener('change', renderStudio);
  garment.addEventListener('change', function () { design.g = garment.value; setSizes(design.g, sSize.value); renderStudio(); });
  txt.addEventListener('input', renderStudio);
  sQty.addEventListener('input', renderStudio);
  artSel.addEventListener('change', function () { design.art = artSel.value; renderStudio(); });
  gScale.addEventListener('input', function () { design.scale = +gScale.value; renderStudio(); });
  gY.addEventListener('input', function () { design.dy = +gY.value; renderStudio(); });

  function applyDesign(cfg) {
    design = { g: cfg.g, fabric: cfg.fabric, ink: cfg.ink, text: cfg.text || '', art: cfg.art || 'none',
               up: null, upName: '', scale: cfg.scale || 100, dy: cfg.dy || 0 };
    garment.value = design.g; txt.value = design.text; artSel.value = design.art;
    gScale.value = design.scale; gY.value = design.dy;
    setSizes(design.g); syncSwatches(); syncUpload(); renderStudio();
    $('#studio').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* graphic upload (resized in the browser to keep the cart light) */
  $('#upBtn').addEventListener('click', function () { $('#upload').click(); });
  $('#upload').addEventListener('change', function (e) {
    var f = e.target.files[0]; e.target.value = '';
    if (!f) return;
    if (!/^image\//.test(f.type)) { toast('Please choose an image file (PNG, JPG, SVG).'); return; }
    if (f.size > 8 * 1024 * 1024) { toast('That image is over 8 MB. Please use a smaller file.'); return; }
    var fr = new FileReader();
    fr.onerror = function () { toast('Could not read that file.'); };
    fr.onload = function () {
      var im = new Image();
      im.onerror = function () { toast('Could not open that image.'); };
      im.onload = function () {
        var iw = im.width || 300, ih = im.height || 300, r = Math.min(1, 420 / Math.max(iw, ih)),
            cv = document.createElement('canvas');
        cv.width = Math.max(1, Math.round(iw * r)); cv.height = Math.max(1, Math.round(ih * r));
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        design.up = cv.toDataURL('image/png'); design.upName = f.name;
        syncUpload(); renderStudio(); toast('Graphic added');
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(f);
  });
  $('#upRemove').addEventListener('click', function () { design.up = null; design.upName = ''; syncUpload(); renderStudio(); });

  /* services tiles */
  $$('.svc button').forEach(function (b) {
    b.addEventListener('click', function () {
      design.g = b.getAttribute('data-g'); garment.value = design.g; setSizes(design.g); renderStudio();
      $('#studio').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  /* ---------- ready-made styles ---------- */
  var activeStyle = 'All';
  function renderChips() {
    var box = $('#chips'); box.textContent = '';
    ['All'].concat(STYLES).forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = s; b.setAttribute('aria-pressed', s === activeStyle ? 'true' : 'false');
      b.addEventListener('click', function () { activeStyle = s; renderChips(); renderDesigns(); });
      box.appendChild(b);
    });
  }
  function renderDesigns() {
    var grid = $('#designGrid'); grid.textContent = '';
    DESIGNS.filter(function (d) { return activeStyle === 'All' || d.style === activeStyle; }).forEach(function (d) {
      var card = document.createElement('article'); card.className = 'item';
      card.innerHTML =
        '<div class="pic ' + STYLE_CLASS[d.style] + '"><svg viewBox="0 0 300 300" aria-hidden="true">' + scene(d) + '</svg></div>' +
        '<div class="info"><h3></h3><p></p><div class="actions">' +
        '<button type="button" data-do="edit">Customise</button><button type="button" data-do="add">Add to cart</button></div></div>';
      $('h3', card).textContent = d.name;
      $('p', card).textContent = d.style + ' · ' + LABEL[d.g] + ' · ' + money(unit(d));
      $('[data-do=edit]', card).addEventListener('click', function () { applyDesign(d); });
      $('[data-do=add]', card).addEventListener('click', function () {
        addToCart({ g: d.g, fabric: d.fabric, ink: d.ink, text: d.text, art: d.art, up: null, scale: 100, dy: 0,
                    size: isBottom(d.g) ? '32' : 'M', qty: 1, name: d.name });
      });
      grid.appendChild(card);
    });
  }
  renderChips(); renderDesigns();

  /* ---------- cart ---------- */
  var cart = store.get('cq2_cart', []);
  var drawer = $('#cart'), overlay = $('#overlay'), lastFocus = null, warned = false;

  function saveCart() {
    var ok = store.set('cq2_cart', cart);
    if (!ok && !warned && cart.some(function (c) { return c.up; })) {
      warned = true; toast('Cart is kept for this visit only (browser storage is full).');
    }
    renderCart();
  }
  function sameItem(a, b) {
    return a.g === b.g && a.fabric === b.fabric && a.ink === b.ink && a.text === b.text && a.art === b.art &&
           a.up === b.up && a.scale === b.scale && a.dy === b.dy && a.size === b.size && a.name === b.name;
  }
  function addToCart(item) {
    var found = cart.filter(function (c) { return sameItem(c, item); })[0];
    if (found) found.qty = Math.min(99, found.qty + item.qty);
    else { item.id = String(Date.now()) + Math.random().toString(16).slice(2, 6); cart.push(item); }
    saveCart(); toast('Added to cart');
  }
  function totals() {
    var qty = 0, sub = 0;
    cart.forEach(function (c) { qty += c.qty; sub += unit(c) * c.qty; });
    var disc = qty >= BULK_QTY ? sub * BULK_OFF : 0, after = sub - disc;
    var ship = (!cart.length || after >= FREE_SHIP) ? 0 : SHIPPING;
    return { qty: qty, sub: sub, disc: disc, ship: ship, total: after + ship };
  }

  function renderCart() {
    var list = $('#cartItems'), t = totals();
    list.textContent = '';
    $('#badge').textContent = t.qty; $('#badge').hidden = t.qty === 0;
    if (!cart.length) {
      var p = document.createElement('p'); p.className = 'empty';
      p.textContent = 'Your cart is empty. Design a piece or pick a ready-made style.'; list.appendChild(p);
    }
    cart.forEach(function (c) {
      var row = document.createElement('div'); row.className = 'ci';
      var th = document.createElement('div'); th.className = 'thumb';
      th.innerHTML = '<svg viewBox="0 0 300 300" aria-hidden="true">' + scene(c) + '</svg>';
      var info = document.createElement('div'); info.className = 'ci-info';
      var h = document.createElement('b'); h.textContent = c.name || ('Custom ' + LABEL[c.g].toLowerCase());
      var s = document.createElement('span');
      s.textContent = 'Size ' + c.size + ' · ' + nameOf(c.fabric) + (c.text ? ' · "' + c.text + '"' : '') +
        (hasArt(c) ? ' · ' + describeArt(c) : '');
      var q = document.createElement('div'); q.className = 'qty';
      var dec = btn('−', 'dec', c.id, 'Decrease quantity'), n = document.createElement('em'), inc = btn('+', 'inc', c.id, 'Increase quantity');
      n.textContent = c.qty; q.appendChild(dec); q.appendChild(n); q.appendChild(inc);
      info.appendChild(h); info.appendChild(s); info.appendChild(q);
      var side = document.createElement('div'); side.className = 'ci-side';
      var pr = document.createElement('b'); pr.textContent = money(unit(c) * c.qty);
      var rm = btn('Remove', 'rm', c.id, 'Remove item'); rm.className = 'rm';
      side.appendChild(pr); side.appendChild(rm);
      row.appendChild(th); row.appendChild(info); row.appendChild(side); list.appendChild(row);
    });
    var rows = [['Subtotal', money(t.sub)]];
    if (t.disc) rows.push(['Bulk discount (10%)', '−' + money(t.disc)]);
    rows.push(['Shipping', cart.length ? (t.ship ? money(t.ship) : 'Free') : '—']);
    rows.push(['Total', money(t.total)]);
    var sum = $('#sum'); sum.textContent = '';
    rows.forEach(function (r, i) {
      var d = document.createElement('div'); if (i === rows.length - 1) d.className = 'tot';
      var a = document.createElement('span'), b = document.createElement('span');
      a.textContent = r[0]; b.textContent = r[1]; d.appendChild(a); d.appendChild(b); sum.appendChild(d);
    });
    $('#toCheckout').disabled = !cart.length;
  }
  function btn(label, act, id, aria) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = label;
    b.setAttribute('data-act', act); b.setAttribute('data-id', id); b.setAttribute('aria-label', aria); return b;
  }

  $('#cartItems').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-act]'); if (!b) return;
    var id = b.getAttribute('data-id'), act = b.getAttribute('data-act');
    var item = cart.filter(function (c) { return c.id === id; })[0]; if (!item) return;
    if (act === 'inc') item.qty = Math.min(99, item.qty + 1);
    if (act === 'dec') item.qty = Math.max(1, item.qty - 1);
    if (act === 'rm') cart = cart.filter(function (c) { return c.id !== id; });
    saveCart();
  });

  function showView(v) {
    $('#cartView').hidden = v !== 'cart'; $('#checkoutView').hidden = v !== 'checkout'; $('#doneView').hidden = v !== 'done';
  }
  function openCart() {
    lastFocus = document.activeElement; showView('cart'); renderCart();
    drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false');
    overlay.hidden = false; document.body.classList.add('lock'); $('#closeCart').focus();
  }
  function closeCart() {
    drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true');
    overlay.hidden = true; document.body.classList.remove('lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $('#cartBtn').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  $('#doneClose').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (drawer.classList.contains('open')) closeCart(); setMenu(false); }
  });
  $('#toCheckout').addEventListener('click', function () { if (cart.length) showView('checkout'); });
  $('#backCart').addEventListener('click', function () { showView('cart'); });

  $('#addBtn').addEventListener('click', function () {
    renderStudio();
    addToCart({ g: design.g, fabric: design.fabric, ink: design.ink, text: design.text, art: design.art, up: design.up,
                scale: design.scale, dy: design.dy, size: sSize.value, qty: clampQty(sQty.value), name: '' });
  });

  /* ---------- checkout ---------- */
  $('#checkoutView').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = $('#cMsg'), f = { name: $('#cName').value.trim(), email: $('#cEmail').value.trim(),
                                phone: $('#cPhone').value.trim(), address: $('#cAddr').value.trim() };
    if (!cart.length) { msg.textContent = 'Your cart is empty.'; return; }
    if (!f.name || !validEmail(f.email) || f.phone.length < 6 || f.address.length < 8) {
      msg.textContent = 'Please complete all fields with a valid email, phone and full address.'; return;
    }
    var t = totals();
    var order = { id: 'CQ-' + Math.floor(100000 + Math.random() * 900000), date: new Date().toISOString(), customer: f,
                  totals: t, payment: 'Cash on delivery',
                  items: cart.map(function (c) { var o = {}; for (var k in c) o[k] = c[k]; if (o.up) o.up = 'uploaded image'; return o; }) };
    var orders = store.get('cq2_orders', []); orders.push(order); store.set('cq2_orders', orders);
    cart = []; saveCart(); e.target.reset(); msg.textContent = '';
    $('#doneText').textContent = 'Order ' + order.id + ' is confirmed. Total ' + money(t.total) +
      ', paid on delivery. We will email ' + f.email + ' with your free proof within one working day.';
    showView('done');
  });

  /* ---------- quote form ---------- */
  $('#useDesign').addEventListener('click', function () {
    renderStudio();
    $('#qPiece').value = design.g; $('#size').value = sSize.value; $('#qty').value = clampQty(sQty.value);
    $('#note').value = 'Piece: ' + LABEL[design.g] + '\nFabric colour: ' + nameOf(design.fabric) +
      '\nText: ' + (design.text || 'none') + '\nGraphic: ' + (describeArt(design) || 'none') +
      '\nText & graphic colour: ' + nameOf(design.ink) +
      (design.up ? '\n(I will send my artwork file ' + design.upName + ' by email.)' : '');
  });

  $('#form').addEventListener('submit', function (e) {
    e.preventDefault();
    var m = $('#msg'), n = $('#name').value.trim(), em = $('#email').value.trim(), note = $('#note').value.trim(),
        piece = $('#qPiece').value, size = $('#size').value.trim(), qty = parseInt($('#qty').value, 10) || 1;
    if (!n || !validEmail(em)) { m.textContent = 'Please enter your name and a valid email address.'; return; }
    if (note.length < 5) { m.textContent = 'Please describe your design in the details box.'; return; }
    var quotes = store.get('cq2_quotes', []);
    quotes.push({ date: new Date().toISOString(), name: n, email: em, piece: piece, size: size, qty: qty, note: note });
    store.set('cq2_quotes', quotes);
    var body = 'Name: ' + n + '\nEmail: ' + em + '\nPiece: ' + LABEL[piece] + '\nSize(s): ' + size + '\nQuantity: ' + qty + '\n\n' + note;
    var a = document.createElement('a');
    a.href = 'mailto:hello@customique.com?subject=' + encodeURIComponent('Quote request from ' + n) + '&body=' + encodeURIComponent(body);
    document.body.appendChild(a); a.click(); a.remove();
    m.textContent = 'Thank you, ' + n + '. Your email app should open: press send, and attach any artwork files.';
    e.target.reset(); $('#qty').value = 1;
  });

  /* ---------- init ---------- */
  renderStudio(); renderCart();
})();
