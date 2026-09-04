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
    { num: "②", title: "ベイズの定理", plan: true },
    { num: "③", title: "確率変数と期待値", plan: true },
    { num: "④", title: "二項分布", plan: true },
    { num: "⑤", title: "ポアソン分布", plan: true },
    { num: "⑥", title: "正規分布", plan: true },
    { num: "⑦", title: "標準化とz表", plan: true },
    { num: "⑧", title: "中心極限定理", plan: true },
    { num: "⑨", title: "指数分布（発展）", plan: true }
  ];

  var CHAP = { CH1: CH1, CH2: CH2 };
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
      // 前は第1章テスト。次は作成済みユニットがあれば（今はなし）
      out += '<a class="btn-secondary" href="ch1-quiz.html">&larr; 前へ：第1章 確認テスト</a>';
      if (idx + 1 < list.length && list[idx + 1].file) {
        out += '<a class="btn btn-primary" href="' + list[idx + 1].file + '">次へ：' + list[idx + 1].title + " &rarr;</a>";
      }
    }
    pager.innerHTML = out;
  }
})();
