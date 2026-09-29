// ====== EDIT THIS PART (paste your own name and photos here) ======
// frame options:
//   "portrait" (3:4) | "phone" (9:16) | "square" (1:1) | "landscape" (4:3) | "wide" (16:9)
//   "auto"  = keeps the photo's own shape (nothing is cropped)
//   or any ratio you like, for example "1200/1599"

const CONFIG = {
  name: "Her Name",
  photos: [
    { src: "assets/photo1.jpg", caption: "Where it began", frame: "portrait" },
    { src: "assets/photo2.jpg", caption: "That trip", frame: "portrait" },
    { src: "assets/photo3.jpg", caption: "My favourite day", frame: "portrait" },
    { src: "assets/photo4.jpg", caption: "My favourite day", frame: "portrait" },
    { src: "assets/photo5.jpg", caption: "My favourite day", frame: "portrait" },
    { src: "assets/photo6.jpg", caption: "My favourite day", frame: "portrait" },
    { src: "assets/photo7.jpg", caption: "My favourite day", frame: "auto" },
  ],
};

var FRAMES = { portrait: 3 / 4, phone: 9 / 16, square: 1, landscape: 4 / 3, wide: 16 / 9 };
// ==================================================================

const $ = (id) => document.getElementById(id);
const show = (el) => el.classList.remove("d-none");
const hide = (el) => el.classList.add("d-none");

// ---------- Happy Birthday tune (loops until the page is closed) ----------
let ctx;
function playTune() {
  ctx ||= new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === "suspended") ctx.resume();
  const N = { G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
  const song = [
    ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
    ["G4", .75], ["G4", .25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
    ["G4", .75], ["G4", .25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
    ["F5", .75], ["F5", .25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2],
  ];
  const beat = 0.55; // seconds per beat; raise for slower
  const start = ctx.currentTime + 0.1;
  let t = start;
  for (const [note, len] of song) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = N[note];
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + len * beat * 0.95);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + len * beat);
    t += len * beat;
  }
  return t - start; // length of the tune in seconds
}

function loopTune() {
  const seconds = playTune();
  setTimeout(loopTune, (seconds + 1) * 1000); // 1.5 second pause between rounds
}

// ---------- Photo frames ----------
var FRAMES = { portrait: 3 / 4, phone: 9 / 16, square: 1, landscape: 4 / 3, wide: 16 / 9 };

function ratioOf(frame) {
  if (FRAMES[frame]) return FRAMES[frame];
  const parts = String(frame).split("/");
  const r = parts.length === 2 ? parts[0] / parts[1] : parseFloat(frame);
  return r > 0 ? r : null; // null means "auto"
}

// ---------- One photo at a time ----------
let idx = 0;

function showPhoto(i) {
  idx = i;
  const totalNoOfPhotos = CONFIG.photos.length;
  const photo = CONFIG.photos[i];
  $("viewer").innerHTML = `
    <figure class="photo-card m-0">
      <div class="phone-frame" id="frame"><img id="photo" src="${photo.src}" alt="${photo.caption}"></div>
      <figcaption>${photo.caption}</figcaption>
    </figure>`;
  const ratio = ratioOf(photo.frame);
  if (ratio) {
    $("frame").style.setProperty("--r", ratio);
  } else {
    $("photo").addEventListener("load", (e) =>
      $("frame").style.setProperty("--r", e.target.naturalWidth / e.target.naturalHeight));
  }
  $("counter").textContent = `${i + 1} / ${totalNoOfPhotos}`;
  $("backBtn").disabled = i === 0;
  $("nextBtn").textContent = i === totalNoOfPhotos - 1 ? "Read my message" : "Next";
}

// ---------- Flow ----------
function runCountdown(done) {
  let n = 3;
  const el = $("count");
  const tick = () => {
    el.textContent = n;
    el.classList.remove("tick");
    void el.offsetWidth; // restart animation
    el.classList.add("tick");
    if (n > 1) { n--; setTimeout(tick, 1000); } else setTimeout(done, 1000);
  };
  tick();
}

$("herName").textContent = CONFIG.name;

$("startBtn").addEventListener("click", () => {
  hide($("start"));
  show($("countdown"));
  runCountdown(() => {
    hide($("countdown"));
    show($("wish"));
    loopTune();
    setTimeout(() => show($("memoriesBtn")), 4000);
  });
});

$("memoriesBtn").addEventListener("click", () => {
  hide($("wish"));
  show($("memories"));
  showPhoto(0);
});

$("backBtn").addEventListener("click", () => showPhoto(idx - 1));

$("nextBtn").addEventListener("click", () => {
  if (idx < CONFIG.photos.length - 1) {
    showPhoto(idx + 1);
  } else {
    hide($("memories"));
    show($("message"));
    window.scrollTo(0, 0);
  }
});
