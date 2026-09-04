/* ==========================================================================
   シミュレーション（動く図）
   - coin-sim があれば「コインの表が出る割合」シミュレーション
   - dice-sim があれば「サイコロの平均が期待値に近づく」シミュレーション
   ページに要素が無ければ何もしません（共通ファイルとして全ページで読んでOK）
   ========================================================================== */
(function () {
  "use strict";

  function $(id) { return document.getElementById(id); }

  function bind(id, fn) {
    var el = $(id);
    if (el) { el.addEventListener("click", fn); }
  }

  /* ---------- コインシミュレーション ---------- */
  var coinSim = $("coin-sim");
  if (coinSim) {
    var coinN = 0;
    var coinH = 0;
    var coinBusy = false;
    var faceEl = $("coin-face");
    var coinNEl = $("coin-n");
    var coinHEl = $("coin-h");
    var coinPEl = $("coin-p");
    var coinBar = $("coin-bar");
    var coinMsg = $("coin-msg");

    function coinPaint() {
      coinNEl.textContent = coinN;
      coinHEl.textContent = coinH;
      var p = coinN ? coinH / coinN : 0;
      coinPEl.textContent = coinN ? (Math.round(p * 1000) / 10) + "%" : "—";
      if (coinBar) { coinBar.style.width = (p * 100) + "%"; }
      if (coinMsg) {
        if (coinN === 0) {
          coinMsg.textContent = "";
        } else if (coinN < 30) {
          coinMsg.textContent = "回数が少ないうちは割合がブレます。「100回投げる」で一気に増やしてみましょう。";
        } else if (Math.abs(p - 0.5) < 0.05) {
          coinMsg.textContent = "回数を重ねると、表の割合は 50%（1/2）の近くに落ち着いてきました。";
        } else {
          coinMsg.textContent = "まだブレています。さらに回数を増やすと 50%（1/2）に近づいていきます。";
        }
      }
    }

    function coinToss() {
      var head = Math.random() < 0.5;
      coinN += 1;
      if (head) { coinH += 1; }
      faceEl.textContent = head ? "表" : "裏";
      faceEl.classList.remove("tossing");
      void faceEl.offsetWidth; /* アニメーション再起動 */
      faceEl.classList.add("tossing");
      coinPaint();
    }

    function coinDisable(off) {
      var els = coinSim.querySelectorAll("button");
      for (var i = 0; i < els.length; i++) { els[i].disabled = off; }
    }

    function coinBurst(k, ms) {
      if (coinBusy) { return; }
      coinBusy = true;
      coinDisable(true);
      var left = k;
      (function next() {
        if (left <= 0) {
          coinBusy = false;
          coinDisable(false);
          return;
        }
        coinToss();
        left -= 1;
        setTimeout(next, ms);
      })();
    }

    bind("coin-once", function () { if (!coinBusy) { coinToss(); } });
    bind("coin-ten", function () { coinBurst(10, 120); });
    bind("coin-hundred", function () { coinBurst(100, 14); });
    bind("coin-reset", function () {
      if (coinBusy) { return; }
      coinN = 0;
      coinH = 0;
      faceEl.textContent = "—";
      faceEl.classList.remove("tossing");
      coinPaint();
    });
    coinPaint();
  }

  /* ---------- サイコロシミュレーション ---------- */
  var diceSim = $("dice-sim");
  if (diceSim) {
    var diceN = 0;
    var diceSum = 0;
    var diceBusy = false;
    var diceCounts = [0, 0, 0, 0, 0, 0];
    var dieFaceEl = $("die-face");
    var dieNEl = $("die-n");
    var dieSumEl = $("die-sum");
    var dieAvgEl = $("die-avg");
    var dieMsg = $("die-msg");
    var barWrap = $("die-bars");
    var barEls = [];

    if (barWrap) {
      for (var i = 0; i < 6; i++) {
        var col = document.createElement("div");
        col.className = "sim-col";
        var cnt = document.createElement("span");
        cnt.className = "cnt";
        cnt.id = "die-cnt" + i;
        cnt.textContent = "0";
        var bar = document.createElement("i");
        bar.className = "colbar";
        bar.id = "die-bar" + i;
        col.appendChild(cnt);
        col.appendChild(bar);
        barWrap.appendChild(col);
        barEls.push(bar);
      }
    }

    function dicePaint() {
      dieNEl.textContent = diceN;
      dieSumEl.textContent = diceSum;
      dieAvgEl.textContent = diceN ? String(Math.round(diceSum / diceN * 100) / 100) : "—";
      var max = 1;
      for (var j = 0; j < 6; j++) {
        if (diceCounts[j] > max) { max = diceCounts[j]; }
      }
      for (var k = 0; k < 6; k++) {
        var h = diceCounts[k] ? Math.round(diceCounts[k] / max * 90) : 0;
        if (barEls[k]) { barEls[k].style.height = h + "px"; }
        var cntEl = $("die-cnt" + k);
        if (cntEl) { cntEl.textContent = diceCounts[k]; }
      }
      if (dieMsg) {
        if (diceN === 0) {
          dieMsg.textContent = "";
        } else if (diceN < 15) {
          dieMsg.textContent = "まだ回数が少なく、平均は大きく動きます。「100回振る」で一気に試してみましょう。";
        } else if (Math.abs(diceSum / diceN - 3.5) < 0.1) {
          dieMsg.textContent = "平均が 3.5 の近くに落ち着いてきました。";
        } else {
          dieMsg.textContent = "続けると、平均は期待値 3.5 に近づいていきます。";
        }
      }
    }

    function diceToss() {
      var face = Math.floor(Math.random() * 6) + 1;
      diceN += 1;
      diceSum += face;
      diceCounts[face - 1] += 1;
      dieFaceEl.textContent = face;
      dieFaceEl.classList.remove("tossing");
      void dieFaceEl.offsetWidth; /* アニメーション再起動 */
      dieFaceEl.classList.add("tossing");
      dicePaint();
    }

    function diceDisable(off) {
      var els = diceSim.querySelectorAll("button");
      for (var i = 0; i < els.length; i++) { els[i].disabled = off; }
    }

    function diceBurst(k, ms) {
      if (diceBusy) { return; }
      diceBusy = true;
      diceDisable(true);
      var left = k;
      (function next() {
        if (left <= 0) {
          diceBusy = false;
          diceDisable(false);
          return;
        }
        diceToss();
        left -= 1;
        setTimeout(next, ms);
      })();
    }

    bind("die-once", function () { if (!diceBusy) { diceToss(); } });
    bind("die-ten", function () { diceBurst(10, 120); });
    bind("die-hundred", function () { diceBurst(100, 14); });
    bind("die-reset", function () {
      if (diceBusy) { return; }
      diceN = 0;
      diceSum = 0;
      diceCounts = [0, 0, 0, 0, 0, 0];
      dieFaceEl.textContent = "—";
      dieFaceEl.classList.remove("tossing");
      dicePaint();
    });
    dicePaint();
  }

  /* ---------- 二項分布シミュレーション ---------- */
  var binomSim = $("binom-sim");
  if (binomSim) {
    var BINOM_N = 10;
    var binomP = 0.5;
    var binomExp = 0;
    var binomBusy = false;
    var binomCounts = [];
    for (var bi = 0; bi <= BINOM_N; bi++) { binomCounts.push(0); }
    var binomExpEl = $("binom-exp");
    var binomAvgEl = $("binom-avg");
    var binomTargetEl = $("binom-target");
    var binomMsg = $("binom-msg");
    var binomBarWrap = $("binom-bars");
    var binomAxisWrap = $("binom-axis");
    var binomBarEls = [];
    var binomCntEls = [];

    if (binomBarWrap) {
      for (var bj = 0; bj <= BINOM_N; bj++) {
        var bcol = document.createElement("div");
        bcol.className = "sim-col";
        var bcnt = document.createElement("span");
        bcnt.className = "cnt";
        bcnt.textContent = "0";
        var bbar = document.createElement("i");
        bbar.className = "colbar";
        bcol.appendChild(bcnt);
        bcol.appendChild(bbar);
        binomBarWrap.appendChild(bcol);
        binomBarEls.push(bbar);
        binomCntEls.push(bcnt);
      }
    }
    if (binomAxisWrap) {
      for (var bk = 0; bk <= BINOM_N; bk++) {
        var al = document.createElement("span");
        al.textContent = bk;
        binomAxisWrap.appendChild(al);
      }
    }

    function binomTarget() {
      if (binomTargetEl) {
        binomTargetEl.textContent = "（期待値 10×p ＝ " + Math.round(BINOM_N * binomP) + "回）";
      }
    }

    function binomAvg() {
      if (!binomExp) { return 0; }
      var s = 0;
      for (var i = 0; i <= BINOM_N; i++) { s += i * binomCounts[i]; }
      return s / binomExp;
    }

    function binomPaint() {
      binomExpEl.textContent = binomExp;
      var avg = binomAvg();
      binomAvgEl.textContent = binomExp ? String(Math.round(avg * 100) / 100) : "—";
      var max = 1;
      for (var m = 0; m <= BINOM_N; m++) {
        if (binomCounts[m] > max) { max = binomCounts[m]; }
      }
      for (var k = 0; k <= BINOM_N; k++) {
        var h = binomCounts[k] ? Math.round(binomCounts[k] / max * 90) : 0;
        binomBarEls[k].style.height = h + "px";
        binomCntEls[k].textContent = binomCounts[k];
      }
      if (binomMsg) {
        if (binomExp === 0) {
          binomMsg.textContent = "";
        } else if (binomExp < 15) {
          binomMsg.textContent = "まだセット数が少なく、形が定まりません。セットを増やしてみましょう。";
        } else {
          binomMsg.textContent = "セットを重ねると、上の二項分布のグラフの形に近づいてきます。";
        }
      }
    }

    function binomRun() {
      var s = 0;
      for (var i = 0; i < BINOM_N; i++) {
        if (Math.random() < binomP) { s += 1; }
      }
      binomCounts[s] += 1;
      binomExp += 1;
      binomPaint();
    }

    function binomDisable(off) {
      var els = binomSim.querySelectorAll("button");
      for (var i = 0; i < els.length; i++) { els[i].disabled = off; }
    }

    function binomBurst(k, ms) {
      if (binomBusy) { return; }
      binomBusy = true;
      binomDisable(true);
      var left = k;
      (function next() {
        if (left <= 0) {
          binomBusy = false;
          binomDisable(false);
          return;
        }
        binomRun();
        left -= 1;
        setTimeout(next, ms);
      })();
    }

    function binomReset() {
      if (binomBusy) { return; }
      for (var i = 0; i <= BINOM_N; i++) { binomCounts[i] = 0; }
      binomExp = 0;
      binomPaint();
    }

    var pgroup = $("binom-pgroup");
    if (pgroup) {
      var pbtns = pgroup.querySelectorAll("button.btn-sim");
      for (var pi = 0; pi < pbtns.length; pi++) {
        (function (btn) {
          btn.addEventListener("click", function () {
            if (binomBusy) { return; }
            binomP = parseFloat(btn.getAttribute("data-p"));
            for (var q = 0; q < pbtns.length; q++) {
              pbtns[q].classList.remove("active");
            }
            btn.classList.add("active");
            binomTarget();
            binomReset();
          });
        })(pbtns[pi]);
      }
    }

    bind("binom-once", function () { if (!binomBusy) { binomRun(); } });
    bind("binom-ten", function () { binomBurst(10, 90); });
    bind("binom-hundred", function () { binomBurst(100, 12); });
    bind("binom-reset", function () { binomReset(); });
    binomTarget();
    binomPaint();
  }

  /* ---------- ポアソン分布シミュレーション ---------- */
  var poisSim = $("pois-sim");
  if (poisSim) {
    var POIS_BINS = 12; /* 0〜12件までを表示 */
    var POIS_STEPS = 1000;
    var poisL = 2;
    var poisExp = 0;
    var poisBusy = false;
    var poisCounts = [];
    for (var pj = 0; pj <= POIS_BINS; pj++) { poisCounts.push(0); }
    var poisExpEl = $("pois-exp");
    var poisAvgEl = $("pois-avg");
    var poisTargetEl = $("pois-target");
    var poisMsg = $("pois-msg");
    var poisBarWrap = $("pois-bars");
    var poisAxisWrap = $("pois-axis");
    var poisBarEls = [];
    var poisCntEls = [];

    if (poisBarWrap) {
      for (var pk = 0; pk <= POIS_BINS; pk++) {
        var pcol = document.createElement("div");
        pcol.className = "sim-col";
        var pcnt = document.createElement("span");
        pcnt.className = "cnt";
        pcnt.textContent = "0";
        var pbar = document.createElement("i");
        pbar.className = "colbar";
        pcol.appendChild(pcnt);
        pcol.appendChild(pbar);
        poisBarWrap.appendChild(pcol);
        poisBarEls.push(pbar);
        poisCntEls.push(pcnt);
      }
    }
    if (poisAxisWrap) {
      for (var pa = 0; pa <= POIS_BINS; pa++) {
        var pal = document.createElement("span");
        pal.textContent = pa;
        poisAxisWrap.appendChild(pal);
      }
    }

    function poisTargetText() {
      if (poisTargetEl) {
        poisTargetEl.textContent = "（期待値 λ ＝ " + poisL + "件）";
      }
    }

    function poisAvgVal() {
      if (!poisExp) { return 0; }
      var s = 0;
      for (var i = 0; i <= POIS_BINS; i++) { s += i * poisCounts[i]; }
      return s / poisExp;
    }

    function poisPaint() {
      poisExpEl.textContent = poisExp;
      var avg = poisAvgVal();
      poisAvgEl.textContent = poisExp ? String(Math.round(avg * 100) / 100) : "—";
      var max = 1;
      for (var m = 0; m <= POIS_BINS; m++) {
        if (poisCounts[m] > max) { max = poisCounts[m]; }
      }
      for (var k = 0; k <= POIS_BINS; k++) {
        var h = poisCounts[k] ? Math.round(poisCounts[k] / max * 90) : 0;
        poisBarEls[k].style.height = h + "px";
        poisCntEls[k].textContent = poisCounts[k];
      }
      if (poisMsg) {
        if (poisExp === 0) {
          poisMsg.textContent = "";
        } else if (poisExp < 15) {
          poisMsg.textContent = "まだセット数が少なく、形が定まりません。セットを増やしてみましょう。";
        } else {
          poisMsg.textContent = "セットを重ねると、上のポアソン分布のグラフの形に近づいてきます。";
        }
      }
    }

    function poisRun() {
      var s = 0;
      for (var i = 0; i < POIS_STEPS; i++) {
        if (Math.random() < poisL / POIS_STEPS) { s += 1; }
      }
      if (s > POIS_BINS) { s = POIS_BINS; }
      poisCounts[s] += 1;
      poisExp += 1;
      poisPaint();
    }

    function poisDisable(off) {
      var els = poisSim.querySelectorAll("button");
      for (var i = 0; i < els.length; i++) { els[i].disabled = off; }
    }

    function poisBurst(k, ms) {
      if (poisBusy) { return; }
      poisBusy = true;
      poisDisable(true);
      var left = k;
      (function next() {
        if (left <= 0) {
          poisBusy = false;
          poisDisable(false);
          return;
        }
        poisRun();
        left -= 1;
        setTimeout(next, ms);
      })();
    }

    function poisReset() {
      if (poisBusy) { return; }
      for (var i = 0; i <= POIS_BINS; i++) { poisCounts[i] = 0; }
      poisExp = 0;
      poisPaint();
    }

    var lgroup = $("pois-lgroup");
    if (lgroup) {
      var lbtns = lgroup.querySelectorAll("button.btn-sim");
      for (var li = 0; li < lbtns.length; li++) {
        (function (btn) {
          btn.addEventListener("click", function () {
            if (poisBusy) { return; }
            poisL = parseFloat(btn.getAttribute("data-lambda"));
            for (var q = 0; q < lbtns.length; q++) {
              lbtns[q].classList.remove("active");
            }
            btn.classList.add("active");
            poisTargetText();
            poisReset();
          });
        })(lbtns[li]);
      }
    }

    bind("pois-once", function () { if (!poisBusy) { poisRun(); } });
    bind("pois-ten", function () { poisBurst(10, 90); });
    bind("pois-hundred", function () { poisBurst(100, 12); });
    bind("pois-reset", function () { poisReset(); });
    poisTargetText();
    poisPaint();
  }

  /* ---------- 正規分布（μ・σ スライダー） ---------- */
  var normSim = $("norm-sim");
  if (normSim) {
    var normMuEl = $("norm-mu");
    var normSigEl = $("norm-sig");
    var normMuVal = $("norm-mu-val");
    var normSigVal = $("norm-sig-val");
    var normPath = $("norm-path");
    var normMsg = $("norm-msg");
    var normL1 = $("norm-l1");
    var normLm = $("norm-lm");
    var normL2 = $("norm-l2");
    var normT1 = $("norm-t1");
    var normTm = $("norm-tm");
    var normT2 = $("norm-t2");

    function normPx(mu, sig, x) {
      var xmin = mu - 4.2 * sig;
      var xmax = mu + 4.2 * sig;
      return 50 + (x - xmin) / (xmax - xmin) * 540;
    }

    function normDraw() {
      var mu = parseFloat(normMuEl.value);
      var sig = parseFloat(normSigEl.value);
      normMuVal.textContent = mu;
      normSigVal.textContent = sig;
      var xmin = mu - 4.2 * sig;
      var xmax = mu + 4.2 * sig;
      var pts = [];
      var N = 90;
      var step = (xmax - xmin) / N;
      for (var i = 0; i <= N; i++) {
        var x = xmin + step * i;
        var fx = Math.exp(-(x - mu) * (x - mu) / (2 * sig * sig)) / (sig * Math.sqrt(2 * Math.PI));
        var peak = 1 / (sig * Math.sqrt(2 * Math.PI));
        var px = normPx(mu, sig, x);
        var py = 190 - 155 * (fx / peak);
        pts.push(px.toFixed(1) + " " + py.toFixed(1));
      }
      if (normPath) { normPath.setAttribute("d", "M" + pts.join(" L")); }
      var p1 = normPx(mu, sig, mu - sig);
      var pm = normPx(mu, sig, mu);
      var p2 = normPx(mu, sig, mu + sig);
      normL1.setAttribute("x1", p1); normL1.setAttribute("x2", p1);
      normLm.setAttribute("x1", pm); normLm.setAttribute("x2", pm);
      normL2.setAttribute("x1", p2); normL2.setAttribute("x2", p2);
      normT1.setAttribute("x", p1); normT1.textContent = "μ−σ";
      normTm.setAttribute("x", pm); normTm.textContent = "μ";
      normT2.setAttribute("x", p2); normT2.textContent = "μ+σ";
      if (normMsg) {
        normMsg.textContent = "μ±σ の範囲 = " + (mu - sig) + "〜" + (mu + sig) + "（約68%のデータが入る目安）。σ を大きくすると、曲線は低く広がります。";
      }
    }

    if (normMuEl && normSigEl) {
      normMuEl.addEventListener("input", normDraw);
      normSigEl.addEventListener("input", normDraw);
    }
    normDraw();
  }

  /* ---------- z表スライダー ---------- */
  var ztabSim = $("ztab-sim");
  if (ztabSim) {
    var ztabZEl = $("ztab-z");
    var ztabVal = $("ztab-val");
    var ztabCurve = $("ztab-curve");
    var ztabAreaPath = $("ztab-areapath");
    var ztabShade = $("ztab-shade");
    var ztabLine = $("ztab-line");
    var ztabLbl = $("ztab-lbl");
    var ztabMsg = $("ztab-msg");

    function erfApprox(v) {
      var s = v < 0 ? -1 : 1;
      v = Math.abs(v);
      var a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
      var a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
      var t = 1 / (1 + p * v);
      var y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-v * v);
      return s * y;
    }

    function normCdf(z) { return 0.5 * (1 + erfApprox(z / Math.sqrt(2))); }

    function ztabDraw() {
      var z = parseFloat(ztabZEl.value);
      ztabVal.textContent = z.toFixed(2);
      var peak = 0.3989422804014327;
      var start = -4.2, end = 4.2;
      var N = 100;
      var step = (end - start) / N;
      function px(x) { return 50 + (x - start) / (end - start) * 540; }
      function fy(x) { return Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI); }
      var pts = [];
      var areaPts = [];
      for (var i = 0; i <= N; i++) {
        var x = start + step * i;
        var yy = 200 - 155 * (fy(x) / peak);
        pts.push(px(x).toFixed(1) + " " + yy.toFixed(1));
        areaPts.push((i === 0 ? "M" : "L") + px(x).toFixed(1) + " " + yy.toFixed(1));
      }
      areaPts.push("L 590.0 200.0 L 50.0 200.0 Z");
      if (ztabCurve) { ztabCurve.setAttribute("d", "M" + pts.join(" L")); }
      if (ztabAreaPath) { ztabAreaPath.setAttribute("d", areaPts.join(" ")); }
      var pz = px(z);
      if (ztabShade) { ztabShade.setAttribute("width", Math.max(0, pz - 30)); }
      if (ztabLine) { ztabLine.setAttribute("x1", pz); ztabLine.setAttribute("x2", pz); }
      if (ztabLbl) {
        ztabLbl.setAttribute("x", pz);
        ztabLbl.textContent = "z = " + z.toFixed(2);
      }
      if (ztabMsg) {
        var cdf = normCdf(z);
        ztabMsg.textContent = "P(Z ≤ z) ≈ " + (Math.round(cdf * 10000) / 10000) +
          "　／　P(Z ≥ z) ≈ " + (Math.round((1 - cdf) * 10000) / 10000) + "（zとともに面積が動きます）";
      }
    }

    if (ztabZEl) { ztabZEl.addEventListener("input", ztabDraw); }
    ztabDraw();
  }

  /* ---------- 中心極限定理シミュレーション ---------- */
  var cltSim = $("clt-sim");
  if (cltSim) {
    var CLT_BINS = 24;
    var CLT_W = 0.125;
    var cltN = 10;
    var cltExp = 0;
    var cltCounts = [];
    for (var ci = 0; ci < CLT_BINS; ci++) { cltCounts.push(0); }
    var cltSum = 0;
    var cltSumSq = 0;
    var cltExpEl = $("clt-exp");
    var cltAvgEl = $("clt-avg");
    var cltSdEl = $("clt-sd");
    var cltMsg = $("clt-msg");
    var cltBarWrap = $("clt-bars");
    var cltAxisWrap = $("clt-axis");
    var cltBarEls = [];
    var cltCntEls = [];

    if (cltBarWrap) {
      for (var bj = 0; bj < CLT_BINS; bj++) {
        var bcol = document.createElement("div");
        bcol.className = "sim-col";
        var bcnt = document.createElement("span");
        bcnt.className = "cnt";
        bcnt.textContent = "0";
        var bbar = document.createElement("i");
        bbar.className = "colbar";
        bcol.appendChild(bcnt);
        bcol.appendChild(bbar);
        cltBarWrap.appendChild(bcol);
        cltBarEls.push(bbar);
        cltCntEls.push(bcnt);
      }
    }
    if (cltAxisWrap) {
      for (var ak = 0; ak < CLT_BINS; ak++) {
        var al = document.createElement("span");
        if (ak === 0) { al.textContent = "0"; }
        else if (ak === 8) { al.textContent = "1"; }
        else if (ak === 16) { al.textContent = "2"; }
        else if (ak === 23) { al.textContent = "3"; }
        cltAxisWrap.appendChild(al);
      }
    }

    function cltSample() {
      var r = Math.random();
      if (r < 0.4) { return 0; }
      if (r < 0.7) { return 1; }
      if (r < 0.9) { return 2; }
      return 3;
    }

    function cltPaint() {
      cltExpEl.textContent = cltExp;
      if (cltExp) {
        var avg = cltSum / cltExp;
        var varObs = Math.max(0, cltSumSq / cltExp - avg * avg);
        cltAvgEl.textContent = String(Math.round(avg * 1000) / 1000);
        cltSdEl.textContent = String(Math.round(Math.sqrt(varObs) * 1000) / 1000);
      } else {
        cltAvgEl.textContent = "—";
        cltSdEl.textContent = "—";
      }
      var max = 1;
      for (var m = 0; m < CLT_BINS; m++) {
        if (cltCounts[m] > max) { max = cltCounts[m]; }
      }
      for (var k = 0; k < CLT_BINS; k++) {
        var h = cltCounts[k] ? Math.round(cltCounts[k] / max * 90) : 0;
        cltBarEls[k].style.height = h + "px";
        cltCntEls[k].textContent = cltCounts[k];
      }
      if (cltMsg) {
        var se = Math.sqrt(2) / Math.sqrt(cltN);
        if (cltExp === 0) {
          cltMsg.textContent = "標本サイズ n = " + cltN + "（理論 SE ≈ " + Math.round(se * 1000) / 1000 + "）。「100回試行」などで標本平均の分布を作ってみましょう。";
        } else {
          cltMsg.textContent = "試行 " + cltExp + " 回・n = " + cltN + "。理論 SE ≈ " + Math.round(se * 1000) / 1000 + " と「実際のばらつき」を比べてみましょう（中心は母平均 μ=1）。";
        }
      }
    }

    function cltRun(k) {
      for (var t = 0; t < k; t++) {
        var s = 0;
        for (var i = 0; i < cltN; i++) { s += cltSample(); }
        var mean = s / cltN;
        var idx = Math.min(CLT_BINS - 1, Math.floor(mean / CLT_W));
        cltCounts[idx] += 1;
        cltExp += 1;
        cltSum += mean;
        cltSumSq += mean * mean;
      }
      cltPaint();
    }

    function cltReset() {
      for (var i = 0; i < CLT_BINS; i++) { cltCounts[i] = 0; }
      cltExp = 0;
      cltSum = 0;
      cltSumSq = 0;
      cltPaint();
    }

    var cltNgroup = $("clt-ngroup");
    if (cltNgroup) {
      var cltNbtns = cltNgroup.querySelectorAll("button.btn-sim");
      for (var ni = 0; ni < cltNbtns.length; ni++) {
        (function (btn) {
          btn.addEventListener("click", function () {
            cltN = parseInt(btn.getAttribute("data-n"), 10);
            for (var q = 0; q < cltNbtns.length; q++) {
              cltNbtns[q].classList.remove("active");
            }
            btn.classList.add("active");
            cltReset();
          });
        })(cltNbtns[ni]);
      }
    }

    bind("clt-run100", function () { cltRun(100); });
    bind("clt-run500", function () { cltRun(500); });
    bind("clt-run2000", function () { cltRun(2000); });
    bind("clt-reset", function () { cltReset(); });
    cltPaint();
  }

  /* ---------- 指数分布（λスライダー） ---------- */
  var expSim = $("exp-sim");
  if (expSim) {
    var expLamEl = $("exp-lam");
    var expVal = $("exp-lam-val");
    var expCurve = $("exp-curve");
    var expMean = $("exp-mean");
    var expMeanLbl = $("exp-meanlbl");
    var expMsg = $("exp-msg");

    function expDraw() {
      var lam = parseFloat(expLamEl.value);
      expVal.textContent = String(Math.round(lam * 10) / 10);
      var pts = [];
      for (var i = 0; i <= 100; i++) {
        var t = 5 * i / 100;
        var px = 70 + t * 106;
        var py = 210 - 150 * Math.exp(-lam * t);
        pts.push(px.toFixed(1) + " " + py.toFixed(1));
      }
      if (expCurve) { expCurve.setAttribute("d", "M" + pts.join(" L")); }
      var mean = 1 / lam;
      var mpx = 70 + mean * 106;
      if (expMean) { expMean.setAttribute("x1", mpx); expMean.setAttribute("x2", mpx); }
      if (expMeanLbl) {
        expMeanLbl.setAttribute("x", Math.min(mpx, 590));
        expMeanLbl.textContent = "平均 1/λ = " + (Math.round(mean * 100) / 100) + "時間";
      }
      if (expMsg) {
        expMsg.textContent = "λ = " + (Math.round(lam * 10) / 10) + " のとき E(T) ≈ " + (Math.round(mean * 100) / 100) +
          "時間。t = 平均までに起きる確率は常に 1 − e^(−1) ≈ 0.632（無記憶性のある指数分布の特徴）です。";
      }
    }

    if (expLamEl) { expLamEl.addEventListener("input", expDraw); }
    expDraw();
  }

  /* ---------- 標本割合シミュレーション ---------- */
  var propSim = $("prop-sim");
  if (propSim) {
    var PROP_BINS = 40;
    var PROP_W = 0.025;
    var PROP_P = 0.3;
    var propN = 50;
    var propExp = 0;
    var propCounts = [];
    for (var pi = 0; pi < PROP_BINS; pi++) { propCounts.push(0); }
    var propSum = 0;
    var propSumSq = 0;
    var propExpEl = $("prop-exp");
    var propAvgEl = $("prop-avg");
    var propSdEl = $("prop-sd");
    var propMsg = $("prop-msg");
    var propBarWrap = $("prop-bars");
    var propAxisWrap = $("prop-axis");
    var propBarEls = [];
    var propCntEls = [];

    if (propBarWrap) {
      for (var bj = 0; bj < PROP_BINS; bj++) {
        var bcol = document.createElement("div");
        bcol.className = "sim-col";
        var bcnt = document.createElement("span");
        bcnt.className = "cnt";
        bcnt.textContent = "0";
        var bbar = document.createElement("i");
        bbar.className = "colbar";
        bcol.appendChild(bcnt);
        bcol.appendChild(bbar);
        propBarWrap.appendChild(bcol);
        propBarEls.push(bbar);
        propCntEls.push(bcnt);
      }
    }
    if (propAxisWrap) {
      for (var ak = 0; ak < PROP_BINS; ak++) {
        var al = document.createElement("span");
        if (ak === 0) { al.textContent = "0"; }
        else if (ak === 10) { al.textContent = "0.25"; }
        else if (ak === 20) { al.textContent = "0.5"; }
        else if (ak === 30) { al.textContent = "0.75"; }
        else if (ak === 39) { al.textContent = "1"; }
        propAxisWrap.appendChild(al);
      }
    }

    function propPaint() {
      propExpEl.textContent = propExp;
      if (propExp) {
        var avg = propSum / propExp;
        var varObs = Math.max(0, propSumSq / propExp - avg * avg);
        propAvgEl.textContent = String(Math.round(avg * 1000) / 1000);
        propSdEl.textContent = String(Math.round(Math.sqrt(varObs) * 1000) / 1000);
      } else {
        propAvgEl.textContent = "—";
        propSdEl.textContent = "—";
      }
      var max = 1;
      for (var m = 0; m < PROP_BINS; m++) {
        if (propCounts[m] > max) { max = propCounts[m]; }
      }
      for (var k = 0; k < PROP_BINS; k++) {
        var h = propCounts[k] ? Math.round(propCounts[k] / max * 90) : 0;
        propBarEls[k].style.height = h + "px";
        propCntEls[k].textContent = propCounts[k];
      }
      if (propMsg) {
        var se = Math.sqrt(PROP_P * (1 - PROP_P) / propN);
        if (propExp === 0) {
          propMsg.textContent = "調査人数 n = " + propN + "（理論 SE ≈ " + Math.round(se * 10000) / 10000 + "）。「100回試行」などで支持率の分布を作りましょう。";
        } else {
          propMsg.textContent = "試行 " + propExp + " 回・n = " + propN + "。支持率の平均は真の値 0.3 の近くに集まります（理論 SE ≈ " + Math.round(se * 10000) / 10000 + "）。";
        }
      }
    }

    function propRun(k) {
      for (var t = 0; t < k; t++) {
        var yes = 0;
        for (var i = 0; i < propN; i++) {
          if (Math.random() < PROP_P) { yes += 1; }
        }
        var phat = yes / propN;
        var idx = Math.min(PROP_BINS - 1, Math.floor(phat / PROP_W));
        propCounts[idx] += 1;
        propExp += 1;
        propSum += phat;
        propSumSq += phat * phat;
      }
      propPaint();
    }

    function propReset() {
      for (var i = 0; i < PROP_BINS; i++) { propCounts[i] = 0; }
      propExp = 0;
      propSum = 0;
      propSumSq = 0;
      propPaint();
    }

    var propNgroup = $("prop-ngroup");
    if (propNgroup) {
      var propNbtns = propNgroup.querySelectorAll("button.btn-sim");
      for (var ni = 0; ni < propNbtns.length; ni++) {
        (function (btn) {
          btn.addEventListener("click", function () {
            propN = parseInt(btn.getAttribute("data-n"), 10);
            for (var q = 0; q < propNbtns.length; q++) {
              propNbtns[q].classList.remove("active");
            }
            btn.classList.add("active");
            propReset();
          });
        })(propNbtns[ni]);
      }
    }

    bind("prop-run100", function () { propRun(100); });
    bind("prop-run1000", function () { propRun(1000); });
    bind("prop-reset", function () { propReset(); });
    propPaint();
  }

  /* ---------- 不偏推定量シミュレーション ---------- */
  var estSim = $("est-sim");
  if (estSim) {
    var estN = 10;
    var estExp = 0;
    var estSumX = 0;
    var estSumVn = 0;
    var estSumS2 = 0;
    var estBusy = false;
    var estExpEl = $("est-exp");
    var estAvgXEl = $("est-avg-x");
    var estAvgVnEl = $("est-avg-vn");
    var estAvgS2El = $("est-avg-s2");
    var estMsg = $("est-msg");

    function estSample() {
      var r = Math.random();
      if (r < 0.4) { return 0; }
      if (r < 0.7) { return 1; }
      if (r < 0.9) { return 2; }
      return 3;
    }

    function estOne() {
      var sum = 0;
      var devsq = 0;
      for (var i = 0; i < estN; i++) {
        var x = estSample();
        sum += x;
      }
      var mean = sum / estN;
      for (var j = 0; j < estN; j++) {
        var y = estSample();
        var d = y - mean;
        devsq += d * d;
      }
      var vn = devsq / estN;
      var s2 = estN > 1 ? devsq / (estN - 1) : 0;
      estExp += 1;
      estSumX += mean;
      estSumVn += vn;
      estSumS2 += s2;
      estPaint();
    }

    function estDisable(off) {
      var els = estSim.querySelectorAll("button");
      for (var i = 0; i < els.length; i++) { els[i].disabled = off; }
    }

    function estRunAnimated(k, ms) {
      if (estBusy) { return; }
      estBusy = true;
      estDisable(true);
      var left = k;
      (function next() {
        if (left <= 0) { estBusy = false; estDisable(false); return; }
        estOne();
        left -= 1;
        setTimeout(next, ms);
      })();
    }

    function estRunFast(k) {
      for (var t = 0; t < k; t++) { estOne(); }
      estPaint();
    }

    function estPaint() {
      estExpEl.textContent = estExp;
      if (estExp) {
        estAvgXEl.textContent = String(Math.round(estSumX / estExp * 1000) / 1000);
        estAvgVnEl.textContent = String(Math.round(estSumVn / estExp * 1000) / 1000);
        estAvgS2El.textContent = String(Math.round(estSumS2 / estExp * 1000) / 1000);
      } else {
        estAvgXEl.textContent = "—";
        estAvgVnEl.textContent = "—";
        estAvgS2El.textContent = "—";
      }
      if (estMsg) {
        var vnTarget = (estN - 1) / estN * 2;
        if (estExp === 0) {
          estMsg.textContent = "標本サイズ n = " + estN + "。目標: 標本平均の平均→μ=1／÷nの分散の平均→約" + Math.round(vnTarget * 1000) / 1000 + "／÷(n−1)の分散の平均→2（σ²）。";
        } else {
          estMsg.textContent = "試行 " + estExp + " 回・n = " + estN + "。÷n の分散の平均は約 " + Math.round(vnTarget * 1000) / 1000 + " に落ち着き、÷(n−1) の分散の平均は σ² = 2 に近づきます。";
        }
      }
    }

    function estReset() {
      if (estBusy) { return; }
      estExp = 0;
      estSumX = 0;
      estSumVn = 0;
      estSumS2 = 0;
      estPaint();
    }

    var estNgroup = $("est-ngroup");
    if (estNgroup) {
      var estNbtns = estNgroup.querySelectorAll("button.btn-sim");
      for (var ni = 0; ni < estNbtns.length; ni++) {
        (function (btn) {
          btn.addEventListener("click", function () {
            estN = parseInt(btn.getAttribute("data-n"), 10);
            for (var q = 0; q < estNbtns.length; q++) {
              estNbtns[q].classList.remove("active");
            }
            btn.classList.add("active");
            estReset();
          });
        })(estNbtns[ni]);
      }
    }

    bind("est-run200", function () { estRunAnimated(200, 8); });
    bind("est-run1000", function () { if (!estBusy) { estRunFast(1000); } });
    bind("est-reset", function () { estReset(); });
    estPaint();
  }
})();
