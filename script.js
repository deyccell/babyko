document.addEventListener("DOMContentLoaded", function () {
  const candles = document.querySelectorAll(".candle");
  const song = document.getElementById("birthdaySong");
  const balloonContainers = document.querySelectorAll(".balloon-container");

  let audioContext, analyser, microphone;

  /* ---------------- 🎤 MIC: Detect Blowing ---------------- */
  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
    return sum / bufferLength > 50;
  }

  /* ---------------- 🕯️ Blow Out Candles ---------------- */
  function blowOutCandles() {
    if ([...candles].some(c => !c.classList.contains("out"))) {
      if (isBlowing()) {
        candles.forEach(candle => candle.classList.add("out"));
        confetti({ particleCount: 250, spread: 70, origin: { y: 0.6 } });

        // After confetti → play song + show balloons
        setTimeout(() => {
          song.play().catch(() => console.warn("Autoplay blocked"));
          showBalloons();
        }, 1000);
      }
    }
  }

  /* ---------------- 🎈 Balloon Animations ---------------- */
  function showBalloons() {
    balloonContainers.forEach((container, i) => {
      container.classList.remove("hidden");
      container.style.opacity = 1;
      container.style.animation = `riseUp 7s ease-out forwards`;
      container.style.animationDelay = `${i * 1.5}s`;

      // When rising finishes → start floating sway
      container.addEventListener(
        "animationend",
        () => {
          container.classList.add("float");
          container.style.animation = "sway 5s ease-in-out infinite alternate";
        },
        { once: true }
      );
    });
  }

  /* ---------------- 🎙️ Access Microphone ---------------- */
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
      });
  }

});
