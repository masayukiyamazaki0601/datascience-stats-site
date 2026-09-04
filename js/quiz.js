/* ==========================================================================
   クイズエンジン＋経験値（XP）システム
   - 選択式クイズ: 正解/不正解の表示＋効果音（Web Audio生成）
   - 正解で経験値を獲得（途中確認=10XP / 章末クイズ=20XP / 確認テスト=25XP）
   - レベルと経験値は localStorage に保存（学習の積み重ね）
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 効果音 ---------- */
  var MUTE_KEY = "dsStatsQuizSoundOff";
  var muted = localStorage.getItem(MUTE_KEY) === "1";
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null;

  function ensureCtx() {
    if (!ctx && AC) {
      try { ctx = new AC(); } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === "suspended" && ctx.resume) { ctx.resume(); }
    return ctx;
  }
  function tone(freq, delay, dur, type, vol) {
    var c = ensureCtx();
    if (!c) { return; }
    function schedule() {
      var t0 = c.currentTime + (delay || 0);
      var osc = c.createOscillator();
      var gain = c.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    }
    if (c.state === "suspended") {
      var p = c.resume ? c.resume() : null;
      if (p && typeof p.then === "function") { p.then(schedule); } else { schedule(); }
    } else {
      schedule();
    }
  }

  /* ---------- スマホ向け: 最初のタップで音をアンロック ----------
     iOS / Android は「ユーザー操作の中で AudioContext を起動」しないと
     効果音を出せないブラウザが多い。最初のタッチ/クリックで先に作っておく。 */
  function unlockAudio() { ensureCtx(); }
  document.addEventListener("touchstart", unlockAudio, { passive: true });
  document.addEventListener("pointerdown", unlockAudio, { passive: true });
  document.addEventListener("click", unlockAudio, { passive: true });
  function playCorrect() {
    if (muted || !ensureCtx()) { return; }
    tone(659.25, 0, 0.16, "sine", 0.22);
    tone(987.77, 0.13, 0.24, "sine", 0.22);
  }
  function playWrong() {
    if (muted || !ensureCtx()) { return; }
    tone(155.56, 0, 0.2, "square", 0.1);
    tone(116.54, 0.18, 0.26, "square", 0.08);
  }

  /* ---------- サウンド ON/OFF ボタン ---------- */
  function makeSoundButton() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "sound-toggle";
    btn.className = "sound-btn" + (muted ? " off" : "");
    updateLabel(btn);
    btn.addEventListener("click", function () {
      muted = !muted;
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
      updateLabel(btn);
      if (!muted) { ensureCtx(); tone(880, 0, 0.1, "sine", 0.2); }
    });
    return btn;
  }
  function updateLabel(btn) {
    btn.textContent = muted ? "🔇 効果音: OFF" : "🔊 効果音: ON";
    btn.className = "sound-btn" + (muted ? " off" : "");
  }
  document.body.appendChild(makeSoundButton());

  /* ---------- 経験値（XP） ---------- */
  var XP_KEY = "dsStatsXp";
  var DONE_KEY = "dsStatsDone";
  var xp = parseInt(localStorage.getItem(XP_KEY) || "0", 10) || 0;
  var done = {};
  try { done = JSON.parse(localStorage.getItem(DONE_KEY) || "{}"); } catch (e) { done = {}; }

  var LEVEL_XP = 100;
  var LEVEL_NAMES = [
    "データ見習い", "集計ビギナー", "統計スターター", "ばらつきハンター",
    "分布リーダー", "分析マスター", "統計の達人", "DS見習い",
    "DS候補生", "データサイエンティスト"
  ];

  function levelOf(x) { return Math.floor(x / LEVEL_XP) + 1; }
  function levelName(l) {
    return (l <= LEVEL_NAMES.length) ? LEVEL_NAMES[l - 1] : "伝説のアナリスト Lv." + l;
  }
  function saveState() {
    localStorage.setItem(XP_KEY, String(xp));
    localStorage.setItem(DONE_KEY, JSON.stringify(done));
  }

  function questionKey(q) {
    var file = (document.body.getAttribute("data-file") || "page") + "/";
    var all = document.querySelectorAll(".quiz-q");
    var idx = 0;
    for (var i = 0; i < all.length; i++) { if (all[i] === q) { idx = i; break; } }
    return file + "q" + idx;
  }
  function xpGainFor(q) {
    var block = q.closest(".quiz-block");
    if (!block) { return 10; }
    if (block.hasAttribute("data-test")) { return 25; }
    return 20;
  }

  function grantXp(q) {
    var key = questionKey(q);
    if (done[key]) { return; }
    done[key] = true;
    var beforeLevel = levelOf(xp);
    xp += xpGainFor(q);
    saveState();
    renderHud();
    var afterLevel = levelOf(xp);
    if (afterLevel > beforeLevel) {
      showToast("レベルアップ! Lv." + afterLevel + " " + levelName(afterLevel));
      if (!muted && ensureCtx()) {
        [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
          tone(f, i * 0.11, 0.22, "triangle", 0.18);
        });
      }
    } else {
      showToast("+ " + xpGainFor(q) + " EXP");
    }
  }

  /* ---------- XP HUD ---------- */
  function makeHud() {
    var hud = document.createElement("div");
    hud.id = "xp-hud";
    hud.className = "xp-hud";
    hud.innerHTML =
      '<div class="xp-top"><span class="xp-level" id="xp-level">Lv.1</span>' +
      '<span class="xp-name" id="xp-name"></span></div>' +
      '<div class="xp-bar"><i id="xp-bar-fill"></i></div>' +
      '<div class="xp-meta"><span id="xp-now">0</span> XP' +
      '<button type="button" id="xp-reset">リセット</button></div>';
    document.body.appendChild(hud);
    hud.querySelector("#xp-reset").addEventListener("click", function () {
      if (!confirm("学習記録（経験値）をリセットしますか？")) { return; }
      xp = 0; done = {}; saveState(); renderHud();
      showToast("学習記録をリセットしました");
    });
  }
  function renderHud() {
    var hud = document.getElementById("xp-hud");
    if (!hud) { return; }
    var level = levelOf(xp);
    var fill = xp % LEVEL_XP;
    var width = (xp === 0) ? 0 : (fill === 0 ? 100 : fill);
    hud.querySelector("#xp-level").textContent = "Lv." + level;
    hud.querySelector("#xp-name").textContent = levelName(level);
    hud.querySelector("#xp-now").textContent = xp;
    hud.querySelector("#xp-bar-fill").style.width = width + "%";
  }
  /* ---------- トースト ---------- */
  var toastTimer = null;
  function showToast(text) {
    var el = document.getElementById("xp-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "xp-toast";
      el.className = "xp-toast";
      document.body.appendChild(el);
    }
    el.textContent = text;
    el.classList.add("show");
    if (toastTimer) { clearTimeout(toastTimer); }
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 1800);
  }

  makeHud();
  renderHud();

  /* ---------- 回答処理 ---------- */
  function correctText(q) {
    var good = q.querySelector('button.opt[data-correct="1"]');
    return good ? good.textContent.replace(/\s+/g, " ").trim() : "";
  }

  function updateBlock(block) {
    if (!block) { return; }
    var qs = block.querySelectorAll(".quiz-q");
    var total = qs.length;
    var answered = 0;
    var score = 0;
    for (var i = 0; i < qs.length; i++) {
      if (qs[i].dataset.result === "ok") { score++; answered++; }
      else if (qs[i].dataset.result === "ng") { answered++; }
    }
    var st = block.querySelector(".quiz-status b");
    if (st) { st.textContent = score; }
    var bar = block.querySelector(".bar-fill");
    if (bar) { bar.style.width = Math.round((answered / total) * 100) + "%"; }
    if (answered === total && total > 0) {
      if (block.hasAttribute("data-test")) { showResult(block, score, total); }
    }
  }

  function showResult(block, score, total) {
    var panel = block.querySelector(".quiz-result");
    if (!panel) { return; }
    var big = panel.querySelector(".score-big");
    var msg = panel.querySelector(".rank-msg");
    panel.classList.remove("perfect", "good", "so-so");
    if (big) { big.textContent = score + " / " + total; }
    var ratio = score / total;
    var text = "";
    if (ratio === 1) {
      panel.classList.add("perfect");
      text = "🎉 満点！ 次のステップへ進みましょう。";
    } else if (ratio >= 0.8) {
      panel.classList.add("good");
      text = "👍 よくできました。間違えた問題の解説を読みましょう。";
    } else if (ratio >= 0.6) {
      panel.classList.add("so-so");
      text = "💪 あと一歩。該当ページを復習して再挑戦しましょう。";
    } else {
      panel.classList.add("so-so");
      text = "📖 もう一度、各ページを復習してから再チャレンジしましょう。";
    }
    if (msg) { msg.textContent = text; }
    panel.classList.add("show");
  }

  function resetQuiz(block) {
    var qs = block.querySelectorAll(".quiz-q");
    for (var i = 0; i < qs.length; i++) {
      qs[i].classList.remove("answered");
      qs[i].dataset.result = "";
      var opts = qs[i].querySelectorAll("button.opt");
      for (var j = 0; j < opts.length; j++) {
        opts[j].disabled = false;
        opts[j].classList.remove("is-correct", "is-wrong");
      }
      var fb = qs[i].querySelector(".quiz-feedback");
      if (fb) { fb.textContent = ""; fb.className = "quiz-feedback"; }
    }
    var st = block.querySelector(".quiz-status b");
    if (st) { st.textContent = 0; }
    var bar = block.querySelector(".bar-fill");
    if (bar) { bar.style.width = "0%"; }
    var panel = block.querySelector(".quiz-result");
    if (panel) { panel.classList.remove("show"); }
  }

  document.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest ? e.target.closest("button.opt") : null;
    if (btn) {
      var q = btn.closest(".quiz-q");
      if (!q || q.classList.contains("answered")) { return; }
      q.classList.add("answered");
      var isOk = btn.getAttribute("data-correct") === "1";
      q.dataset.result = isOk ? "ok" : "ng";
      var opts = q.querySelectorAll("button.opt");
      for (var i = 0; i < opts.length; i++) { opts[i].disabled = true; }
      if (isOk) {
        btn.classList.add("is-correct");
      } else {
        btn.classList.add("is-wrong");
        var good = q.querySelector('button.opt[data-correct="1"]');
        if (good) { good.classList.add("is-correct"); }
      }
      var fb = q.querySelector(".quiz-feedback");
      if (fb) {
        fb.classList.remove("ok", "ng");
        fb.classList.add(isOk ? "ok" : "ng");
        fb.textContent = isOk
          ? "✅ 正解！その調子です。"
          : "❌ 不正解… 正解は「" + correctText(q) + "」でした。";
      }
      if (isOk) { playCorrect(); grantXp(q); } else { playWrong(); }
      updateBlock(q.closest(".quiz-block"));
      return;
    }
    var retry = e.target && e.target.closest ? e.target.closest("button.retry") : null;
    if (retry) {
      var block = retry.closest(".quiz-block");
      if (block) { resetQuiz(block); }
    }
  });
})();
