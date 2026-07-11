/* Lumi 3D — realistic-render AI firefly mascot.
   <lumi-mascot-3d variant="soft|tech|balanced" expression="idle|happy|thinking|explaining|hint|celebrating|supportive|loading" size="200" mode="full|mark" anim="on|off" halo="on|off" shadow="on|off"> */
(function () {
  if (customElements.get('lumi-mascot-3d')) return;

  var VARIANTS = {
    soft: {
      hi: '#F0E9FF', mid: '#B4A4F6', lo: '#6E5DD0', deep: '#4A3D9E',
      rim: '#FFE3A1', belly: '#FFD066', bellyCore: '#FFF6DF',
      wing: '#EDE7FF', tip: '#FFD66B', glow: '#FFDF9E',
      eyeHi: '#564B80', eyeLo: '#1C1440', cheek: '#F6A9C4',
      circuit: '#FFFFFF', circuitOp: 0, sparkles: true
    },
    tech: {
      hi: '#7488D8', mid: '#37478F', lo: '#1A2258', deep: '#0D1130',
      rim: '#5EEBFF', belly: '#3ED2F0', bellyCore: '#DCFBFF',
      wing: '#D9F5FF', tip: '#5EEBFF', glow: '#57DBFF',
      eyeHi: '#3A4C86', eyeLo: '#070A20', cheek: '#7C8BE0',
      circuit: '#9FF3FF', circuitOp: 0.85, sparkles: false
    },
    balanced: {
      hi: '#C6CDFF', mid: '#6E7BEE', lo: '#3A43B8', deep: '#262D84',
      rim: '#FFD27C', belly: '#FFBE55', bellyCore: '#FFF3D0',
      wing: '#E6EBFF', tip: '#FFC94F', glow: '#FFD27C',
      eyeHi: '#4A4370', eyeLo: '#14102E', cheek: '#FF9FB0',
      circuit: '#BFD4FF', circuitOp: 0.4, sparkles: false
    }
  };

  var css = '' +
    ':host{display:inline-block;line-height:0}' +
    '.l3-float{animation:l3Float 3.8s ease-in-out infinite}' +
    '.l3-glow{animation:l3Glow 3.8s ease-in-out infinite}' +
    '.l3-shadow{transform-box:fill-box;transform-origin:center;animation:l3Shadow 3.8s ease-in-out infinite}' +
    '.l3-wing{transform-box:fill-box;transform-origin:center 85%;animation:l3Wing 1.4s ease-in-out infinite}' +
    '.l3-wing.r{animation-delay:.2s}' +
    '.l3-orbit{transform-origin:130px 140px;animation:l3Orbit 2.6s linear infinite}' +
    '.l3-tw{animation:l3Tw 2s ease-in-out infinite}' +
    '.l3-tw.d1{animation-delay:.4s}.l3-tw.d2{animation-delay:.9s}.l3-tw.d3{animation-delay:1.3s}' +
    '.l3-think{animation:l3Tw 1.6s ease-in-out infinite}' +
    '.l3-think.d1{animation-delay:.35s}.l3-think.d2{animation-delay:.7s}' +
    '.l3-pop{transform-box:fill-box;transform-origin:center;animation:l3Pop 1.8s ease-in-out infinite}' +
    ':host([anim="off"]) *{animation:none!important}' +
    '@keyframes l3Float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}' +
    '@keyframes l3Glow{0%,100%{opacity:.6}50%{opacity:1}}' +
    '@keyframes l3Shadow{0%,100%{transform:scaleX(1);opacity:.35}50%{transform:scaleX(.86);opacity:.22}}' +
    '@keyframes l3Wing{0%,100%{transform:rotate(0deg) scaleY(1)}50%{transform:rotate(-8deg) scaleY(.88)}}' +
    '@keyframes l3Orbit{to{transform:rotate(360deg)}}' +
    '@keyframes l3Tw{0%,100%{opacity:.15}50%{opacity:1}}' +
    '@keyframes l3Pop{0%,100%{transform:scale(.85);opacity:.7}50%{transform:scale(1.1);opacity:1}}';

  function star(cx, cy, r, color, cls, op) {
    var k = r * 0.22;
    return '<path class="' + (cls || '') + '" d="M' + cx + ' ' + (cy - r) +
      ' Q' + (cx + k) + ' ' + (cy - k) + ' ' + (cx + r) + ' ' + cy +
      ' Q' + (cx + k) + ' ' + (cy + k) + ' ' + cx + ' ' + (cy + r) +
      ' Q' + (cx - k) + ' ' + (cy + k) + ' ' + (cx - r) + ' ' + cy +
      ' Q' + (cx - k) + ' ' + (cy - k) + ' ' + cx + ' ' + (cy - r) + 'Z" fill="' + color + '" opacity="' + (op == null ? 1 : op) + '"/>';
  }

  function glossEye(cx, cy, p, uid, r) {
    r = r || 11;
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + r + '" ry="' + (r * 1.08) + '" fill="url(#' + uid + 'e)"/>' +
      '<circle cx="' + (cx - r * 0.32) + '" cy="' + (cy - r * 0.42) + '" r="' + (r * 0.34) + '" fill="#fff" opacity=".95"/>' +
      '<circle cx="' + (cx + r * 0.32) + '" cy="' + (cy + r * 0.28) + '" r="' + (r * 0.14) + '" fill="#fff" opacity=".55"/>' +
      '<ellipse cx="' + cx + '" cy="' + (cy + r * 0.78) + '" rx="' + (r * 0.5) + '" ry="' + (r * 0.16) + '" fill="' + p.rim + '" opacity=".35"/>';
  }
  function happyEye(cx, cy, c) {
    return '<path d="M' + (cx - 11) + ' ' + (cy + 2) + ' Q' + cx + ' ' + (cy - 12) + ' ' + (cx + 11) + ' ' + (cy + 2) + '" stroke="' + c + '" stroke-width="5.5" fill="none" stroke-linecap="round"/>';
  }
  function winkEye(cx, cy, c) {
    return '<path d="M' + (cx - 10) + ' ' + (cy - 1) + ' Q' + cx + ' ' + (cy + 7) + ' ' + (cx + 10) + ' ' + (cy - 1) + '" stroke="' + c + '" stroke-width="5.5" fill="none" stroke-linecap="round"/>';
  }
  function softEye(cx, cy, c) {
    return '<path d="M' + (cx - 10) + ' ' + (cy - 3) + ' A10 10 0 0 0 ' + (cx + 10) + ' ' + (cy - 3) + ' L' + (cx + 10) + ' ' + (cy + 1) + ' A10 9 0 0 1 ' + (cx - 10) + ' ' + (cy + 1) + 'Z" fill="' + c + '"/>' +
      '<circle cx="' + (cx - 3) + '" cy="' + cy + '" r="2.6" fill="#fff" opacity=".9"/>';
  }

  function face(p, expr, uid) {
    var c = p.eyeLo, eyes, mouth, extras = '';
    switch (expr) {
      case 'happy':
        eyes = happyEye(108, 118, c) + happyEye(152, 118, c);
        mouth = '<path d="M114 137 A16 13 0 0 0 146 137 Z" fill="' + c + '"/><path d="M122 145 A9 6 0 0 0 138 145 Z" fill="#FF8FA3" opacity=".85"/>';
        break;
      case 'thinking':
        eyes = glossEye(112, 113, p, uid, 9.5) + glossEye(154, 113, p, uid, 9.5);
        mouth = '<path d="M122 141 q8 4 16 -1" stroke="' + c + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
        extras = '<circle class="l3-think" cx="182" cy="66" r="3.4" fill="' + p.tip + '" filter="url(#' + uid + 'f2)"/><circle class="l3-think d1" cx="196" cy="50" r="4.6" fill="' + p.tip + '" filter="url(#' + uid + 'f2)"/><circle class="l3-think d2" cx="208" cy="32" r="6" fill="' + p.tip + '" filter="url(#' + uid + 'f2)"/>';
        break;
      case 'explaining':
        eyes = glossEye(108, 116, p, uid) + glossEye(152, 116, p, uid);
        mouth = '<ellipse cx="130" cy="142" rx="9" ry="8" fill="' + c + '"/><ellipse cx="130" cy="145" rx="5" ry="3.6" fill="#FF8FA3" opacity=".85"/>';
        extras = '<path class="l3-tw" d="M172 132 a14 14 0 0 1 0 20" stroke="' + p.tip + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
          '<path class="l3-tw d1" d="M182 126 a22 22 0 0 1 0 32" stroke="' + p.tip + '" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>';
        break;
      case 'hint':
        eyes = winkEye(108, 118, c) + glossEye(152, 116, p, uid);
        mouth = '<path d="M119 139 Q130 149 141 141" stroke="' + c + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
        extras = '<g class="l3-pop">' + star(196, 44, 15, p.tip, '', 0.45) + star(196, 44, 13, p.tip) +
          '<path d="M196 22 v-8 M214 44 h8 M209 30 l6 -6 M209 58 l6 6" stroke="' + p.tip + '" stroke-width="3" stroke-linecap="round"/></g>';
        break;
      case 'celebrating':
        eyes = happyEye(108, 118, c) + happyEye(152, 118, c);
        mouth = '<path d="M112 136 A18 15 0 0 0 148 136 Z" fill="' + c + '"/><path d="M121 146 A10 7 0 0 0 139 146 Z" fill="#FF8FA3" opacity=".85"/>';
        extras = star(42, 66, 8, p.tip, 'l3-tw') + star(216, 84, 6.5, '#FF8FA3', 'l3-tw d1') +
          star(58, 206, 6, p.hi, 'l3-tw d2') + star(206, 196, 8, p.tip, 'l3-tw d3') +
          star(130, 26, 7, '#FF8FA3', 'l3-tw d1') +
          '<circle class="l3-tw d2" cx="30" cy="140" r="4" fill="' + p.tip + '"/><circle class="l3-tw" cx="228" cy="146" r="4" fill="' + p.hi + '"/>';
        break;
      case 'supportive':
        eyes = softEye(108, 118, c) + softEye(152, 118, c);
        mouth = '<path d="M122 140 Q130 146 138 140" stroke="' + c + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
        extras = '<path class="l3-tw" d="M196 96 c0 -5 8 -5 8 0 c0 4 -8 8 -8 8 c0 0 -8 -4 -8 -8 c0 -5 8 -5 8 0" fill="#FF8FA3" transform="translate(4 -34) scale(1.15)"/>';
        break;
      case 'loading':
        eyes = '<circle cx="108" cy="118" r="6" fill="' + c + '"/><circle cx="152" cy="118" r="6" fill="' + c + '"/>';
        mouth = '<path d="M124 140 h12" stroke="' + c + '" stroke-width="4" stroke-linecap="round"/>';
        extras = '<g class="l3-orbit"><circle cx="130" cy="44" r="8" fill="' + p.tip + '" opacity=".4" filter="url(#' + uid + 'f4)"/><circle cx="130" cy="44" r="5" fill="' + p.tip + '"/><circle cx="215" cy="185" r="4" fill="' + p.tip + '" opacity=".65"/><circle cx="45" cy="185" r="3" fill="' + p.tip + '" opacity=".35"/></g>';
        break;
      default:
        eyes = glossEye(108, 118, p, uid) + glossEye(152, 118, p, uid);
        mouth = '<path d="M119 139 Q130 149 141 139" stroke="' + c + '" stroke-width="4" fill="none" stroke-linecap="round"/>';
    }
    var s = eyes +
      '<ellipse cx="94" cy="136" rx="8.5" ry="5" fill="' + p.cheek + '" opacity=".5" filter="url(#' + uid + 'f3)"/>' +
      '<ellipse cx="166" cy="136" rx="8.5" ry="5" fill="' + p.cheek + '" opacity=".5" filter="url(#' + uid + 'f3)"/>' +
      mouth;
    return { face: s, extras: extras };
  }

  function defs(p, uid) {
    return '<defs>' +
      '<radialGradient id="' + uid + 'b" cx="36%" cy="26%" r="88%"><stop offset="0%" stop-color="' + p.hi + '"/><stop offset="42%" stop-color="' + p.mid + '"/><stop offset="78%" stop-color="' + p.lo + '"/><stop offset="100%" stop-color="' + p.deep + '"/></radialGradient>' +
      '<radialGradient id="' + uid + 'e" cx="32%" cy="26%" r="85%"><stop offset="0%" stop-color="' + p.eyeHi + '"/><stop offset="100%" stop-color="' + p.eyeLo + '"/></radialGradient>' +
      '<radialGradient id="' + uid + 'g"><stop offset="0%" stop-color="' + p.bellyCore + '"/><stop offset="45%" stop-color="' + p.belly + '"/><stop offset="100%" stop-color="' + p.belly + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + uid + 'h"><stop offset="0%" stop-color="' + p.glow + '" stop-opacity=".8"/><stop offset="55%" stop-color="' + p.glow + '" stop-opacity=".25"/><stop offset="100%" stop-color="' + p.glow + '" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="' + uid + 'w" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset="100%" stop-color="' + p.wing + '" stop-opacity=".3"/></linearGradient>' +
      '<filter id="' + uid + 'f2" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="1.6"/></filter>' +
      '<filter id="' + uid + 'f3" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="3"/></filter>' +
      '<filter id="' + uid + 'f4" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4.5"/></filter>' +
      '<filter id="' + uid + 'f8" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="8"/></filter>' +
      '<clipPath id="' + uid + 'c"><ellipse cx="130" cy="142" rx="56" ry="62"/></clipPath>' +
      '</defs>';
  }

  function wing(cx, cy, rot, uid, p, cls) {
    return '<g class="l3-wing' + cls + '">' +
      '<ellipse cx="' + cx + '" cy="' + cy + '" rx="30" ry="16" transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')" fill="url(#' + uid + 'w)" opacity=".85"/>' +
      '<ellipse cx="' + cx + '" cy="' + (cy - 4) + '" rx="18" ry="6" transform="rotate(' + rot + ' ' + cx + ' ' + cy + ')" fill="#fff" opacity=".55" filter="url(#' + uid + 'f3)"/>' +
      '</g>';
  }

  function antenna(x1, y1, cx, cy, x2, y2, p, uid) {
    return '<path d="M' + x1 + ' ' + y1 + ' C' + cx + ' ' + cy + ' ' + (x2 + 8) + ' ' + (y2 + 8) + ' ' + x2 + ' ' + y2 + '" stroke="' + p.deep + '" stroke-width="4.5" stroke-linecap="round" fill="none"/>' +
      '<circle cx="' + x2 + '" cy="' + y2 + '" r="11" fill="' + p.tip + '" opacity=".45" filter="url(#' + uid + 'f4)"/>' +
      '<circle cx="' + x2 + '" cy="' + y2 + '" r="5.5" fill="' + p.tip + '"/>' +
      '<circle cx="' + (x2 - 1.8) + '" cy="' + (y2 - 1.8) + '" r="1.7" fill="#fff" opacity=".9"/>';
  }

  function fullSvg(p, expr, size, halo, shadow, uid) {
    var f = face(p, expr, uid);
    var tilt = expr === 'supportive' ? ' transform="rotate(4 130 140)"' : '';
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lumi 3D mascot, ' + expr + '">' +
      defs(p, uid) +
      (halo !== 'off' ? '<circle class="l3-glow" cx="130" cy="146" r="112" fill="url(#' + uid + 'h)"/>' : '') +
      (shadow !== 'off' ? '<ellipse class="l3-shadow" cx="130" cy="234" rx="44" ry="8" fill="#05061A" opacity=".35" filter="url(#' + uid + 'f4)"/>' : '') +
      '<g class="l3-float"><g' + tilt + '>' +
      wing(70, 94, -32, uid, p, '') + wing(190, 94, 32, uid, p, ' r') +
      antenna(112, 86, 106, 68, 90, 52, p, uid) +
      antenna(148, 86, 154, 68, 170, 52, p, uid) +
      '<ellipse cx="130" cy="142" rx="56" ry="62" fill="url(#' + uid + 'b)"/>' +
      '<g clip-path="url(#' + uid + 'c)">' +
      '<ellipse cx="130" cy="218" rx="66" ry="36" fill="' + p.deep + '" opacity=".55" filter="url(#' + uid + 'f8)"/>' +
      '<ellipse class="l3-glow" cx="130" cy="180" rx="46" ry="38" fill="url(#' + uid + 'g)"/>' +
      '<ellipse class="l3-glow" cx="130" cy="184" rx="22" ry="16" fill="' + p.bellyCore + '" opacity=".8" filter="url(#' + uid + 'f8)"/>' +
      '<path d="M173 106 A56 62 0 0 1 144 200" stroke="' + p.rim + '" stroke-width="7" fill="none" stroke-linecap="round" opacity=".6" filter="url(#' + uid + 'f4)"/>' +
      '<path d="M87 106 A56 62 0 0 0 112 199" stroke="#FFFFFF" stroke-width="5" fill="none" stroke-linecap="round" opacity=".22" filter="url(#' + uid + 'f4)"/>' +
      '<ellipse cx="106" cy="98" rx="22" ry="11" transform="rotate(-20 106 98)" fill="#fff" opacity=".5" filter="url(#' + uid + 'f4)"/>' +
      '<circle cx="99" cy="93" r="4" fill="#fff" opacity=".85" filter="url(#' + uid + 'f2)"/>' +
      (p.circuitOp > 0 ?
        '<g opacity="' + p.circuitOp + '">' +
        '<g stroke="' + p.circuit + '" stroke-width="3.4" stroke-linecap="round" fill="none" filter="url(#' + uid + 'f3)" opacity=".8"><path d="M108 170 h16 l7 7 h14"/><path d="M118 188 h10 l6 -6"/></g>' +
        '<g stroke="' + p.circuit + '" stroke-width="1.8" stroke-linecap="round" fill="none"><path d="M108 170 h16 l7 7 h14"/><path d="M118 188 h10 l6 -6"/></g>' +
        '<circle cx="105" cy="170" r="2.6" fill="' + p.circuit + '"/><circle cx="148" cy="177" r="2.6" fill="' + p.circuit + '"/><circle cx="115" cy="188" r="2.2" fill="' + p.circuit + '"/>' +
        '</g>' : '') +
      '</g>' +
      (p.sparkles ? star(52, 80, 7, p.tip, 'l3-tw', 0.9) + star(212, 110, 5.5, p.tip, 'l3-tw d2', 0.8) + star(196, 200, 6.5, p.tip, 'l3-tw d1', 0.85) : '') +
      f.face +
      '</g>' + f.extras + '</g></svg>';
  }

  function markSvg(p, size, halo, uid) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lumi 3D icon">' +
      '<defs>' +
      '<radialGradient id="' + uid + 'b" cx="36%" cy="26%" r="88%"><stop offset="0%" stop-color="' + p.hi + '"/><stop offset="42%" stop-color="' + p.mid + '"/><stop offset="78%" stop-color="' + p.lo + '"/><stop offset="100%" stop-color="' + p.deep + '"/></radialGradient>' +
      '<radialGradient id="' + uid + 'e" cx="32%" cy="26%" r="85%"><stop offset="0%" stop-color="' + p.eyeHi + '"/><stop offset="100%" stop-color="' + p.eyeLo + '"/></radialGradient>' +
      '<radialGradient id="' + uid + 'g"><stop offset="0%" stop-color="' + p.bellyCore + '"/><stop offset="50%" stop-color="' + p.belly + '"/><stop offset="100%" stop-color="' + p.belly + '" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + uid + 'h"><stop offset="0%" stop-color="' + p.glow + '" stop-opacity=".75"/><stop offset="60%" stop-color="' + p.glow + '" stop-opacity=".2"/><stop offset="100%" stop-color="' + p.glow + '" stop-opacity="0"/></radialGradient>' +
      '<filter id="' + uid + 'f2" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="1.4"/></filter>' +
      '<filter id="' + uid + 'f4" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="3.5"/></filter>' +
      '<clipPath id="' + uid + 'c"><circle cx="60" cy="68" r="37"/></clipPath>' +
      '</defs>' +
      (halo !== 'off' ? '<circle cx="60" cy="68" r="52" fill="url(#' + uid + 'h)"/>' : '') +
      '<path d="M50 34 C46 24 40 20 34 15" stroke="' + p.deep + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
      '<path d="M70 34 C74 24 80 20 86 15" stroke="' + p.deep + '" stroke-width="3.5" stroke-linecap="round" fill="none"/>' +
      '<circle cx="34" cy="14" r="8" fill="' + p.tip + '" opacity=".4" filter="url(#' + uid + 'f4)"/><circle cx="34" cy="14" r="4.5" fill="' + p.tip + '"/>' +
      '<circle cx="86" cy="14" r="8" fill="' + p.tip + '" opacity=".4" filter="url(#' + uid + 'f4)"/><circle cx="86" cy="14" r="4.5" fill="' + p.tip + '"/>' +
      '<circle cx="60" cy="68" r="37" fill="url(#' + uid + 'b)"/>' +
      '<g clip-path="url(#' + uid + 'c)">' +
      '<ellipse cx="60" cy="112" rx="42" ry="22" fill="' + p.deep + '" opacity=".5" filter="url(#' + uid + 'f4)"/>' +
      '<ellipse cx="60" cy="94" rx="30" ry="22" fill="url(#' + uid + 'g)"/>' +
      '<path d="M88 46 A37 37 0 0 1 70 103" stroke="' + p.rim + '" stroke-width="5" fill="none" stroke-linecap="round" opacity=".55" filter="url(#' + uid + 'f4)"/>' +
      '<ellipse cx="44" cy="40" rx="13" ry="6.5" transform="rotate(-22 44 40)" fill="#fff" opacity=".55" filter="url(#' + uid + 'f2)"/>' +
      '</g>' +
      '<ellipse cx="47" cy="62" rx="7.5" ry="8.1" fill="url(#' + uid + 'e)"/><circle cx="44.5" cy="59" r="2.5" fill="#fff" opacity=".95"/>' +
      '<ellipse cx="73" cy="62" rx="7.5" ry="8.1" fill="url(#' + uid + 'e)"/><circle cx="70.5" cy="59" r="2.5" fill="#fff" opacity=".95"/>' +
      '<path d="M52 76 Q60 83 68 76" stroke="' + p.eyeLo + '" stroke-width="3" fill="none" stroke-linecap="round"/>' +
      '</svg>';
  }

  var Lumi3D = /** @class */ (function () {
    function C() { return Reflect.construct(HTMLElement, [], C); }
    C.prototype = Object.create(HTMLElement.prototype);
    C.prototype.constructor = C;
    C.observedAttributes = ['variant', 'expression', 'size', 'mode', 'halo', 'shadow'];
    C.prototype.connectedCallback = function () { this.renderLumi(); };
    C.prototype.attributeChangedCallback = function () { if (this.isConnected) this.renderLumi(); };
    C.prototype.renderLumi = function () {
      var p = VARIANTS[this.getAttribute('variant')] || VARIANTS.balanced;
      var expr = this.getAttribute('expression') || 'idle';
      var size = parseInt(this.getAttribute('size') || '200', 10);
      var mode = this.getAttribute('mode') || 'full';
      var halo = this.getAttribute('halo') || 'on';
      var shadow = this.getAttribute('shadow') || 'on';
      var uid = 'l3' + Math.random().toString(36).slice(2, 8);
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = '<style>' + css + '</style>' +
        (mode === 'mark' ? markSvg(p, size, halo, uid) : fullSvg(p, expr, size, halo, shadow, uid));
    };
    Object.setPrototypeOf(C, HTMLElement);
    return C;
  })();

  customElements.define('lumi-mascot-3d', Lumi3D);
})();
