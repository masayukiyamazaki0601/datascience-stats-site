/* ==========================================================================
   統計学入門 for Data Science - 共通ナビゲーション
   - レッスンページ上部の「ユニット切替タブ」を生成
   - ページ下部の「前へ / 次へ」ボタンを生成（Otona Math 風）
   ========================================================================== */
(function () {
  "use strict";

  // 第1章のレッスン一覧（タブと前後ナビで使用）
  var UNITS = [
    { file: "ch1-1-data.html", num: "①", title: "データと尺度" },
    { file: "ch1-2-center.html", num: "②", title: "中心傾向" },
    { file: "ch1-3-quartile.html", num: "③", title: "四分位数・箱ひげ図" },
    { file: "ch1-4-variance.html", num: "④", title: "分散と標準偏差" },
    { file: "ch1-5-shape.html", num: "⑤", title: "分布の形・外れ値・標準化" },
    { file: "ch1-6-correlation.html", num: "⑥", title: "相関と因果" },
    { file: "ch1-quiz.html", num: "T", title: "章末テスト" }
  ];

  var body = document.body;
  var currentFile = body.getAttribute("data-file");
  var currentIndex = -1;
  for (var i = 0; i < UNITS.length; i++) {
    if (UNITS[i].file === currentFile) { currentIndex = i; break; }
  }

  // ---- レッスンページ上部のユニットタブ ----
  var tabs = document.getElementById("lesson-tabs");
  if (tabs && currentIndex >= 0) {
    var tabHtml = "";
    for (var j = 0; j < UNITS.length; j++) {
      var u = UNITS[j];
      var active = (j === currentIndex) ? ' class="unit-chip active"' : ' class="unit-chip"';
      tabHtml += '<a href="' + u.file + '"' + active + ">"
               + (u.num === "T" ? "📝 確認テスト" : "Unit " + (j + 1) + " " + u.num + " " + u.title)
               + "</a>";
    }
    tabs.innerHTML = tabHtml;
  }

  // ---- ページ下部の前へ / 次へ ----
  var pager = document.getElementById("pager");
  if (pager) {
    var out = "";
    if (currentIndex >= 0) {
      if (currentIndex > 0) {
        var prev = UNITS[currentIndex - 1];
        out += '<a class="btn-secondary" href="' + prev.file + '">&larr; 前へ：'
             + prev.num + " " + prev.title + "</a>";
      }
      if (currentIndex < UNITS.length - 1) {
        var next = UNITS[currentIndex + 1];
        out += '<a class="btn btn-primary" href="' + next.file + '">次へ：'
             + next.num + " " + next.title + " &rarr;</a>";
      } else {
        out += '<a class="btn btn-primary" href="index.html">第1章 修了 🎉 コース概要へ &rarr;</a>';
      }
    }
    pager.innerHTML = out;
  }
})();
