// ==UserScript==
// @name         WaniKani Review Stats
// @namespace    https://github.com/frogstair
// @version      0.1
// @description  Show some extra statistics about your latest WaniKani review session
// @author       frogstair
// @match        https://www.wanikani.com/review
// @match        https://www.wanikani.com/review/session
// @icon         https://www.google.com/s2/favicons?domain=atomicobject.com
// @grant        none
// ==/UserScript==

var stats = {
  total_done: 0,
  total_kanji: 0,
  total_vocabulary: 0,
  total_radicals: 0,
  total_readings: 0,
  total_translations: 0,
  correct_kanji: 0,
  correct_vocabulary: 0,
  correct_radicals: 0,
  correct_readings: 0,
  correct_meanings: 0,
};

var itemcompleted = false;
var ready = false;
var loader = document.getElementById("loading");

var obs = new MutationObserver((ml, observer) => {
  ml.forEach((mutation) => {
    if (mutation.attributeName) {
      attach();
    }
  });
});

(function () {
  "use strict";
  if (window.location.pathname != "/review")
    obs.observe(loader, { attributes: true, attributeFilter: ["style"] });
  else attach();
})();

function attach() {
  if (ready) {
    return;
  }
  ready = true;
  obs.disconnect();
  var l = document.getElementById("reviews-summary");
  if (l) {
    lesson_complete();
  } else {
    lesson_not_complete();
  }
}

function lesson_complete() {
  stats = JSON.parse(window.sessionStorage.getItem("statsscript"));
  console.log("You are done, congratulations! Here are your stats");
  console.log(stats);
}

function lesson_not_complete() {
  console.log("Start review/lesson");
  var af = document.getElementById("answer-form");

  af.childNodes[1].childNodes[1].childNodes[3].addEventListener(
    "mouseup",
    complete_item
  );
  document.addEventListener(
    "keyup",
    (e) => {
      if (e.key == "Enter") {
        complete_item();
      }
    },
    true
  );
}

function complete_item() {
  var ur = document.getElementById("user-response");
  var fs = ur.parentElement;

  var ic = fs.classList.contains("incorrect");
  var yc = fs.classList.contains("correct");
  var ha = ic || yc;

  if (!ha) {
    return;
  }

  if (itemcompleted) {
    itemcompleted = false;
    return;
  }

  var ip = document
    .getElementById("question-type")
    .classList.contains("reading");

  stats.total_done += 1;
  var t = document.getElementById("character").classList[0];

  switch (t) {
    case "vocabulary":
      stats.total_vocabulary += 1;
      break;
    case "kanji":
      stats.total_kanji += 1;
      break;
    case "radical":
      stats.total_radicals += 1;
      break;
  }

  if (ip) {
    stats.total_readings += 1;
  } else {
    stats.total_translations += 1;
  }

  if (!ic) {
    switch (t) {
      case "vocabulary":
        stats.correct_vocabulary += 1;
        break;
      case "kanji":
        stats.correct_kanji += 1;
        break;
      case "radical":
        stats.correct_radicals += 1;
        break;
    }

    if (ip) {
      stats.correct_readings += 1;
    } else {
      stats.correct_meanings += 1;
    }
  } else {
  }
  sessionStorage.setItem("statsscript", JSON.stringify(stats));
  itemcompleted = true;
}
