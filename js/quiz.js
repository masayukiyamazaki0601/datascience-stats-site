/* ==========================================================================
   選択式クイズエンジン（正解/不正解の表示 ＋ 効果音）
   - 効果音は Web Audio API で生成（音声ファイル不要・オフラインでもOK）
   - サイドバー下のボタンで ON/OFF 切替（localStorage に保存）
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 効果音 ---------- */
  var MUTE_KEY = "dsStatsQuizSoundOff";
  var muted = localStorage.getItem(MUTE_KEY) === "1";
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null;

  function ensureCtx() {
    if (!ctx && AC) { ctx = new AC(); }
    if (ctx && ctx.state === "suspended") { ctx.resume(); }
    return ctx;
  }
  function tone(freq, delay, dur, type, vol) {
    if (!ctx) { return; }
    var t0 = ctx.currentTime + (delay || 0);
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }
  function playCorrect() {           // 正解：明るい2音（ミ → シ）
    if (muted || !ensureCtx()) { return; }
    tone(659.25, 0, 0.16, "sine", 0.22);
    tone(987.77, 0.13, 0.24, "sine", 0.22);
  }
  function playWrong() {             // 不正解：低いブザー音
    if (muted || !ensureCtx()) { return; }
    tone(155.56, 0, 0.2, "square", 0.1);
    tone(116.54, 0.18, 0.26, "square", 0.08);
  }
  function finishSound() {           // 全問回答：ファンファーレ風
    if (muted || !ensureCtx()) { return; }
    [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) {
      tone(f, i * 0.11, 0.22, "triangle", 0.2);
    });
  }

  /* ---------- サウンド ON/OFF ボタン ---------- */
  function makeSoundButton() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "sound-toggle";
    btn.className = "sound-btn" + (muted ? " off" : "");
    btn.setAttribute("aria-pressed", muted ? "false" : "true");
    updateLabel(btn);
    btn.addEventListener("click", function () {
      muted = !muted;
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
      updateLabel(btn);
      if (!muted) { ensureCtx(); tone(880, 0, 0.1, "sine", 0.2); }  // ON確認音
    });
    return btn;
  }
  function updateLabel(btn) {
    btn.textContent = muted ? "🔇 効果音: OFF" : "🔊 効果音: ON";
    btn.className = "sound-btn" + (muted ? " off" : "");
  }
  // 画面右下に固定表示（CSS の position: fixed で配置）
  document.body.appendChild(makeSoundButton());

  /* ---------- クイズの回答処理 ---------- */
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

    // 章末テスト用: 進捗バー
    var bar = block.querySelector(".bar-fill");
    if (bar) {
      bar.style.width = Math.round((answered / total) * 100) + "%";
    }
    // 全問回答で結果を表示
    if (answered === total && total > 0) {
      if (block.hasAttribute("data-test")) {
        showResult(block, score, total);
      }
      if (!block.dataset.doneNotified) {
        block.dataset.doneNotified = "1";
        finishSound();
      }
    }
  }

  function showResult(block, score, total) {
    var panel = block.querySelector(".quiz-result");
    if (!panel) { return; }
    var big = panel.querySelector(".score-big");
    var msg = panel.querySelector(".rank-msg");
    panel.classList.remove("perfect", "good", "so-so");
    if (big) { big.textContent = score + " / " + total; }
    var text = "";
    if (score === total) {
      panel.classList.add("perfect");
      text = "🎉 満点！ 記述統計はもうマスターです！次の第2章へ進みましょう。";
    } else if (score / total >= 0.8) {
      panel.classList.add("good");
      text = "👍 よくできました！間違えた問題の解説を読んでから次へ進みましょう。";
    } else if (score / total >= 0.6) {
      panel.classList.add("so-so");
      text = "💪 あと一歩！ 間違えた問題を中心に、該当ページを復習してみましょう。";
    } else {
      panel.classList.add("so-so");
      text = "📖 もう一度、第1章の各ページを復習してから再チャレンジしましょう。";
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
    block.dataset.doneNotified = "";
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
      if (isOk) { playCorrect(); } else { playWrong(); }
      updateBlock(q.closest(".quiz-block"));
      return;
    }
    var retry = e.target && e.target.closest ? e.target.closest("button.retry") : null;
    if (retry) {
      var block = retry.closest(".quiz-block");
      if (block) { resetQuiz(block); }
    }
  });
/* @@PART2@@ */
})();
