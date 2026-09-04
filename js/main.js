/* ==========================================================================
   統計学入門 for Data Science - 共通ナビゲーション
   - レッスン上部のユニット切替タブを章ごとに生成（未作成は「予定」表示）
   - ページ下部の「前へ / 次へ」を生成
   ========================================================================== */
(function () {
  "use strict";

  var CH1 = [
    { file: "ch1-1-data.html", num: "①", title: "データと尺度" },
    { file: "ch1-2-center.html", num: "②", title: "中心傾向" },
    { file: "ch1-3-quartile.html", num: "③", title: "四分位数・箱ひげ図" },
    { file: "ch1-4-variance.html", num: "④", title: "分散と標準偏差" },
    { file: "ch1-5-shape.html", num: "⑤", title: "分布の形・外れ値・標準化" },
    { file: "ch1-6-correlation.html", num: "⑥", title: "相関と因果" },
    { file: "ch1-quiz.html", num: "T", title: "章末テスト" }
  ];

  var CH2 = [
    { file: "ch2-1-basic.html", num: "①", title: "確率の基本・条件付き確率", done: true },
    { file: "ch2-2-bayes.html", num: "②", title: "ベイズの定理", done: true },
    { file: "ch2-3-expectation.html", num: "③", title: "確率変数と期待値", done: true },
    { file: "ch2-4-binomial.html", num: "④", title: "二項分布", done: true },
    { file: "ch2-5-poisson.html", num: "⑤", title: "ポアソン分布", done: true },
    { file: "ch2-6-normal.html", num: "⑥", title: "正規分布", done: true },
    { file: "ch2-7-ztable.html", num: "⑦", title: "標準化とz表", done: true },
    { file: "ch2-8-clt.html", num: "⑧", title: "中心極限定理", done: true },
    { file: "ch2-9-exponential.html", num: "⑨", title: "指数分布（発展）", done: true }
  ];

  var CH3 = [
    { file: "ch3-1-sampling.html", num: "①", title: "母集団と標本（サンプリング）", done: true },
    { file: "ch3-2-estimator.html", num: "②", title: "点推定と不偏推定量", done: true },
    { file: "ch3-3-se.html", num: "③", title: "標本平均の分布と標準誤差", done: true },
    { num: "④", title: "区間推定と信頼区間の考え方", plan: true },
    { num: "⑤", title: "母平均の区間推定（σ既知）", plan: true },
    { num: "⑥", title: "母平均の区間推定（t分布）", plan: true },
    { num: "⑦", title: "サンプルサイズの決め方", plan: true }
  ];

  var CHAP = { CH1: CH1, CH2: CH2, CH3: CH3 };
  var body = document.body;
  var currentFile = body.getAttribute("data-file");
  var current = null;
  var which = null;

  if (currentFile) {
    for (var c in CHAP) {
      var list = CHAP[c];
      for (var i = 0; i < list.length; i++) {
        if (list[i].file === currentFile) {
          current = { list: list, index: i, key: c };
          which = c;
          break;
        }
      }
      if (current) { break; }
    }
  }

  // ---- ユニット切替タブ ----
  var tabs = document.getElementById("lesson-tabs");
  if (tabs && current) {
    var html = "";
    var list = current.list;
    for (var j = 0; j < list.length; j++) {
      var u = list[j];
      if (u.file) {
        var active = (u.file === currentFile) ? ' class="unit-chip active"' : ' class="unit-chip"';
        html += '<a href="' + u.file + '"' + active + ">Unit " + (j + 1) + " " + u.num + " " + u.title + "</a>";
      } else {
        html += '<span class="unit-chip plan">Unit ' + (j + 1) + " " + u.num + " " + u.title + "（予定）</span>";
      }
    }
    tabs.innerHTML = html;
  }

  // ---- ページ下部の前へ / 次へ ----
  var pager = document.getElementById("pager");
  if (pager && current) {
    var out = "";
    var idx = current.index;
    var list = current.list;
    if (which === "CH1") {
      if (idx > 0) {
        out += '<a class="btn-secondary" href="' + list[idx - 1].file + '">&larr; 前へ：' + list[idx - 1].title + "</a>";
      }
      if (idx < list.length - 1) {
        out += '<a class="btn btn-primary" href="' + list[idx + 1].file + '">次へ：' + list[idx + 1].title + " &rarr;</a>";
      } else {
        out += '<a class="btn btn-primary" href="index.html">第1章 修了 🎉 コース概要へ &rarr;</a>';
      }
    } else if (which === "CH2") {
      // 前へ：Unit①なら第1章テスト、それ以外は前のユニット
      if (idx === 0) {
        out += '<a class="btn-secondary" href="ch1-quiz.html">&larr; 前へ：第1章 確認テスト</a>';
      } else if (idx > 0 && list[idx - 1].file) {
        out += '<a class="btn-secondary" href="' + list[idx - 1].file + '">&larr; 前へ：' + list[idx - 1].title + "</a>";
      }
      // 次へ：次のユニット、または第3章へ
      if (idx + 1 < list.length && list[idx + 1].file) {
        out += '<a class="btn btn-primary" href="' + list[idx + 1].file + '">次へ：' + list[idx + 1].title + " &rarr;</a>";
      } else if (CH3[0] && CH3[0].file) {
        out += '<a class="btn btn-primary" href="' + CH3[0].file + '">第2章 修了 🎉 第3章へ &rarr;</a>';
      }
    } else if (which === "CH3") {
      // 前へ：Unit①なら第2章の最後、それ以外は前のユニット
      if (idx === 0) {
        out += '<a class="btn-secondary" href="ch2-9-exponential.html">&larr; 前へ：第2章 ⑨ 指数分布（発展）</a>';
      } else if (idx > 0 && list[idx - 1].file) {
        out += '<a class="btn-secondary" href="' + list[idx - 1].file + '">&larr; 前へ：' + list[idx - 1].title + "</a>";
      }
      // 次へ：作成済みの次のユニットがあれば
      if (idx + 1 < list.length && list[idx + 1].file) {
        out += '<a class="btn btn-primary" href="' + list[idx + 1].file + '">次へ：' + list[idx + 1].title + " &rarr;</a>";
      }
    }
    pager.innerHTML = out;
  }
})();

/* ==========================================================================
   図のクリック／タップ拡大（figure 内の svg をオーバーレイ表示）
   - スマホで縮小されて読めない図を、タップで等倍表示して読めるようにする
   - figure が無いページでは何もしない
   ========================================================================== */
(function () {
  "use strict";

  function zoomClose() {
    var z = document.getElementById("fig-zoom");
    if (z && z.parentNode) { z.parentNode.removeChild(z); }
    document.removeEventListener("keydown", zoomEsc);
  }

  function zoomEsc(e) {
    if (e.key === "Escape") { zoomClose(); }
  }

  function zoomOpen(svg) {
    if (document.getElementById("fig-zoom")) { return; }
    var fig = svg.closest ? svg.closest(".figure") : null;

    var wrap = document.createElement("div");
    wrap.id = "fig-zoom";
    wrap.className = "fig-zoom";

    var img = svg.cloneNode(true);
    img.classList.remove("zoomable");
    img.removeAttribute("tabindex");
    wrap.appendChild(img);

    if (fig) {
      var cap = fig.querySelector(".figure-caption");
      if (cap) {
        var c = document.createElement("p");
        c.className = "fig-zoom-cap";
        c.textContent = cap.textContent;
        wrap.appendChild(c);
      }
    }

    var close = document.createElement("button");
    close.type = "button";
    close.className = "fig-zoom-close";
    close.setAttribute("aria-label", "拡大表示を閉じる");
    close.textContent = "×";
    wrap.appendChild(close);

    document.body.appendChild(wrap);

    close.addEventListener("click", function (e) {
      e.stopPropagation();
      zoomClose();
    });
    wrap.addEventListener("click", function (e) {
      if (e.target === wrap) { zoomClose(); }
    });
    document.addEventListener("keydown", zoomEsc);
  }

  var zoomSvgs = document.querySelectorAll(".figure svg");
  for (var zi = 0; zi < zoomSvgs.length; zi++) {
    (function (svg) {
      svg.classList.add("zoomable");
      svg.setAttribute("tabindex", "0");
      svg.addEventListener("click", function (e) {
        e.preventDefault();
        zoomOpen(svg);
      });
    })(zoomSvgs[zi]);
  }
})();
