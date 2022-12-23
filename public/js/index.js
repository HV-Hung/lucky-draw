/* controls elements available user (canvas UI) */
const canvasUI = {
  start: document.querySelector(".btn--start"),
};
const luckyUserElement = document.getElementById("lucky-user");
const infoElement = document.getElementById("lucky-username");

let values = [];
for (let i = 0; i <= 9; i++) values.push(i);
/* main game object */
const GAME = {
  defCash: 100,
  bet: 10,
  values,
  random: [],
};
GAME.cash = GAME.defCash;

/* init canvas */
const canva = document.getElementById("canva");
const ctx = canva.getContext("2d");

/* init UI */

/* Settings display */
refreshRender();

window.onresize = refreshRender;

function refreshRender() {
  setDisplayCanvas();
  computePosElems();
  renderCanvas(); // because canvas will reset
}
/* Settings display canvas */
function setDisplayCanvas() {
  // 4x3
  canva.width = canva.parentNode.clientWidth;
  canva.height = (canva.width * 3) / 4;
}
/* Settings display canvas UI elements */

/* Display current state on canvas */
function renderCanvas() {
  // это в отличии от clearRect помогает избедать потери fps
  canva.width = canva.parentNode.clientWidth;

  for (let drum = 1; drum <= 3; drum++) {
    GAME[`drum${drum}`].draw();
  }
}
/* Compute position of display elements */
function computePosElems() {
  const { width, height } = canva;

  computeDrums(width, height);
}
/* Compute position of display Drums */
function computeDrums(width, height) {
  const drumOpts = {
    w: width * 0.25,
    h: height * 0.35,
    values: GAME.values,
    ctx,
  };
  drumOpts.x = (width * 0.25) / 2;
  drumOpts.y = height * 0.1 + canvasUI.start.clientHeight / 2;

  GAME.drum1 = GAME.drum1 ? GAME.drum1.setting(drumOpts) : new Drum(drumOpts);
  drumOpts.x += drumOpts.w;
  GAME.drum2 = GAME.drum2 ? GAME.drum2.setting(drumOpts) : new Drum(drumOpts);
  drumOpts.x += drumOpts.w;
  GAME.drum3 = GAME.drum3 ? GAME.drum3.setting(drumOpts) : new Drum(drumOpts);
}

/*
    Game Code of simulator
  */

function addLeadingZeros(num, totalLength) {
  return String(num).padStart(totalLength, "0");
}
function simulate(data) {
  canvasUI.start.disabled = true;
  luckyUserElement.classList.add("hide")
  new Animation()
    .add({
      duration: 800,
      cb: () => {},
    })
    .start();

  const Anim = new Animation();
  let duration = 0;
  let step = 1500;
  const resultNumber = addLeadingZeros(data?.lucky_number, 3);
  for (let i = 1; i <= 3; i++) {
    GAME.random[i - 1] = Number(resultNumber[i - 1]) + i * 10;

    duration += step;
    step *= 0.9;

    Anim.add({
      duration,
      timing: "ease-out",
      cb: (progress) => {
        let currentTurn = GAME.random[i - 1] * progress;
        GAME[`drum${i}`].turn(currentTurn);

        if (progress > 0.99) GAME[`drum${i}`].isStopped = true;
        else GAME[`drum${i}`].isStopped = false;
      },
    });
  }

  Anim.add({
    duration,
    cb: renderCanvas,
  })
    .execAtEnd(() => {
      const combo = [];
      for (let i = 1; i <= 3; i++) {
        combo.push(GAME[`drum${i}`].currentValue);
      }

      new Animation()
        .add({
          duration: 800,
          cb: () => {},
        })
        .start();
      infoElement.textContent = data.name+ " " +data.email;
      luckyUserElement.classList.remove("hide");

      canvasUI.start.disabled = false;
    })
    .start();
}
canvasUI.start.onclick = () => {
  fetch("/luckynumber")
    .then((res) => res.json())
    .then((data) => {
      simulate(data);
    });
  // simulate(Math.floor(Math.random() * 1000));
};
function getWinnnings(combo = [], bet = 10) {
  const res = checkCombo(combo);
  let defRes = 0;
  // user faild
  if (res.weight < 1) return defRes;

  const winnnings = {
    // weight -> val
    1: { 7: 10 },
    2: {
      1: 100,
      2: 200,
      3: 300,
      4: 400,
      5: 500,
      6: 750,
      7: 1000,
    },
    3: {
      1: 2500,
      2: 5000,
      3: 15000,
      4: 25000,
      5: 50000,
      6: 75000,
      7: 1000000,
    },
  };

  if (winnnings[res.weight] && winnnings[res.weight][res.val]) {
    return winnnings[res.weight][res.val] * bet * 0.1;
  }

  return defRes;
}
/* return weight combo */
function checkCombo(combo = []) {
  /* (default) user faild */
  const res = { weight: 0 };
  /* check on 3 in a row */
  if (combo[0] === combo[1] && combo[1] === combo[2]) {
    res.val = combo[1];
    res.weight = 3;
  } else if (combo[0] === combo[1] || combo[1] === combo[2]) {
    /* check on 2 in a row */
    res.val = combo[1];
    res.weight = 2;
  } else if (combo.some((val) => val === 7)) {
    /* find any value equal 7 */
    res.val = 7;
    res.weight = 1;
  }

  return res;
}



