(function () {
  var path = window.location.pathname.toLowerCase();
  var isCoinPage = path.endsWith("coin.html") || path.endsWith("/coin");
  var isResultPage = path.endsWith("result.html") || path.endsWith("/result");

  if (isCoinPage) {
    setupCoinPage();
  }

  if (isResultPage) {
    setupResultPage();
  }

  function setupCoinPage() {
    var coin = document.getElementById("coin");
    var btn = document.getElementById("flipBtn");
    var particles = document.getElementById("coinParticles");
    var courageBar = document.getElementById("hudCourage");
    var burnoutBar = document.getElementById("hudBurnout");
    if (!coin || !btn) {
      return;
    }

    // 初始化 HUD 数值
    var courage = 40 + Math.round(Math.random() * 60);
    var burnout = 30 + Math.round(Math.random() * 70);
    if (courageBar && burnoutBar) {
      courageBar.style.width = courage + "%";
      burnoutBar.style.width = burnout + "%";
    }

    btn.addEventListener("click", function () {
      if (btn.disabled) {
        return;
      }

      var result = Math.random() < 0.5 ? "辞" : "不辞";
      btn.disabled = true;
      btn.textContent = "天意加载中...";
      coin.classList.remove("flip-quit", "flip-stay");

      // Force reflow so the same animation can replay.
      void coin.offsetWidth;
      coin.classList.add(result === "辞" ? "flip-quit" : "flip-stay");

      if (particles) {
        particles.classList.remove("burst");
        void particles.offsetWidth;
        particles.classList.add("burst");
      }

      window.setTimeout(function () {
        sessionStorage.setItem("quitCoinResult", result);
        sessionStorage.setItem("quitHUDCourage", String(courage));
        sessionStorage.setItem("quitHUDBurnout", String(burnout));
        sessionStorage.setItem("quitCoinGrade", getGrade(result, courage, burnout));
        window.location.href = "result.html";
      }, 2300);
    });
  }

  function setupResultPage() {
    var badge = document.getElementById("resultBadge");
    var fortune = document.getElementById("fortuneText");
    var shareBtn = document.getElementById("shareBtn");
    var gradeBadge = document.getElementById("gradeBadge");
    var courageBar = document.getElementById("hudCourageResult");
    var burnoutBar = document.getElementById("hudBurnoutResult");
    if (!badge || !fortune || !shareBtn) {
      return;
    }

    var result = sessionStorage.getItem("quitCoinResult");
    if (result !== "辞" && result !== "不辞") {
      result = Math.random() < 0.5 ? "辞" : "不辞";
    }

    badge.textContent = result;
    badge.classList.toggle("stay", result === "不辞");
    fortune.textContent = getFortune(result);

    var courage = parseInt(sessionStorage.getItem("quitHUDCourage") || "", 10);
    var burnout = parseInt(sessionStorage.getItem("quitHUDBurnout") || "", 10);
    if (isNaN(courage)) {
      courage = result === "辞" ? 80 : 55;
    }
    if (isNaN(burnout)) {
      burnout = result === "辞" ? 75 : 50;
    }
    if (courageBar && burnoutBar) {
      courageBar.style.width = Math.max(0, Math.min(100, courage)) + "%";
      burnoutBar.style.width = Math.max(0, Math.min(100, burnout)) + "%";
    }

    if (gradeBadge) {
      gradeBadge.textContent = sessionStorage.getItem("quitCoinGrade") || getGrade(result, courage, burnout);
    }

    shareBtn.addEventListener("click", function () {
      var text = "我在【辞了么】抛硬币，结果是：" + result + "。快来测测你的天意！";

      if (navigator.share) {
        navigator.share({
          title: "辞了么",
          text: text,
          url: window.location.origin + window.location.pathname.replace("result.html", "index.html")
        }).catch(function () {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          window.alert("已复制分享文案，快发给好友吧！");
        }).catch(function () {
          window.alert(text);
        });
      } else {
        window.alert(text);
      }
    });
  }

  function getFortune(result) {
    if (result === "辞") {
      return "上上签：云开月明，宜动不宜守。你心里那团火还在，离开并非逃跑，而是奔赴更匹配你的山海。带着底气行动，先找方向，再向前一跃。";
    }
    return "中上签：根基未稳，宜蓄势待发。此刻不辞，不是认输，而是先把筹码攒满。暗中修炼技能与机会，待时机成熟，一击即中。";
  }

  function getGrade(result, courage, burnout) {
    if (result === "辞" && courage >= 80 && burnout >= 70) {
      return "SSR · 破茧辞职签";
    }
    if (result === "辞") {
      return "SR · 行动派辞职签";
    }
    if (burnout <= 45) {
      return "SR · 稳住工作签";
    }
    return "R · 再等等观察签";
  }
})();
