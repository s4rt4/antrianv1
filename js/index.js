// index.js - logic untuk halaman user (index.html)

/*
localStorage keys used:
- "antrian_lastTaken"   : last ticket number taken (global)
- "antrian_lastCalled"  : last number called (global)
- "antrian_maxTickets"  : max tickets per day (global), default 100
SessionStorage used:
- "myTicket"            : last ticket number taken by this browser (for reprint)
Theme: saved in localStorage "theme" ("light" or "dark")
*/

(function(){
  // helper
  const $ = id => document.getElementById(id);

  // initialize values
  function toInt(v, def=0){
    const n = parseInt(v,10);
    return isNaN(n) ? def : n;
  }

  let lastTaken = toInt(localStorage.getItem("antrian_lastTaken"), 0);
  let lastCalled = toInt(localStorage.getItem("antrian_lastCalled"), 0);
  let maxTickets = toInt(localStorage.getItem("antrian_maxTickets"), 100);

  const takeBtn = $("takeBtn");
  const reprintBtn = $("reprintBtn");
  const myTicketEl = $("myTicket");
  const lastCalledEl = $("lastCalled");
  const lastTakenEl = $("lastTaken");
  const remainingEl = $("remaining");
  const showCallBtn = $("showCallBtn");
  const clock = $("clock");
  const themeBtn = $("themeBtn");

  // clock
  function updateClock(){
    const now = new Date();
    clock.innerText = now.toLocaleString();
  }
  setInterval(updateClock, 1000);
  updateClock();

  // theme
  function applyTheme(theme){
    if(theme === "dark") document.body.classList.add("dark");
    else document.body.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }
  const savedTheme = localStorage.getItem("theme") || "light";
  applyTheme(savedTheme);
  themeBtn.addEventListener("click", ()=>{
    const newTheme = document.body.classList.contains("dark") ? "light" : "dark";
    applyTheme(newTheme);
  });

  // display stats
  function renderStats(){
    lastTaken = toInt(localStorage.getItem("antrian_lastTaken"), 0);
    lastCalled = toInt(localStorage.getItem("antrian_lastCalled"), 0);
    maxTickets = toInt(localStorage.getItem("antrian_maxTickets"), 100);
    lastCalledEl.innerText = lastCalled>0 ? lastCalled : "—";
    lastTakenEl.innerText = lastTaken>0 ? lastTaken : "—";
    const remaining = Math.max(0, maxTickets - lastTaken);
    remainingEl.innerText = remaining;
  }
  renderStats();

  // Polling to keep user page synced with admin changes
  setInterval(renderStats, 1000);

  // take ticket
  takeBtn.addEventListener("click", ()=>{
    lastTaken = toInt(localStorage.getItem("antrian_lastTaken"), 0);
    maxTickets = toInt(localStorage.getItem("antrian_maxTickets"), 100);
    if(lastTaken >= maxTickets){
      alert("Maaf, tiket sudah habis untuk hari ini.");
      return;
    }
    lastTaken++;
    localStorage.setItem("antrian_lastTaken", lastTaken);
    sessionStorage.setItem("myTicket", lastTaken); // untuk reprint di browser ini
    myTicketEl.innerText = "Nomor antrian Anda: " + lastTaken;
    renderStats();

    // small print window
    const printHtml = `
      <html><head><title>Tiket Antrian</title>
      <style>
        body{font-family:Arial;text-align:center;padding:20px}
        h1{font-size:60px;margin:20px 0}
        p{margin:6px}
      </style>
      </head><body>
      <h2>Tiket Antrian — Loket 1</h2>
      <h1>${lastTaken}</h1>
      <p>${new Date().toLocaleString()}</p>
      <p>Silakan menunggu panggilan.</p>
      </body></html>
    `;
    const w = window.open("","_blank","width=360,height=420");
    w.document.write(printHtml);
    w.document.close();
    w.focus();
    w.print();
    // optionally close after print (some browsers block)
    // setTimeout(()=>w.close(), 500);

  });

  // reprint ticket
  reprintBtn.addEventListener("click", ()=>{
    const myTicket = sessionStorage.getItem("myTicket");
    if(!myTicket){
      alert("Anda belum mengambil tiket sebelumnya di perangkat ini.");
      return;
    }
    const w = window.open("","_blank","width=360,height=420");
    w.document.write(`
      <html><head><title>Cetak Ulang</title>
      <style>body{font-family:Arial;text-align:center;padding:20px}h1{font-size:60px}</style>
      </head><body>
      <h2>Tiket Antrian — Loket 1</h2>
      <h1>${myTicket}</h1>
      <p>${new Date().toLocaleString()}</p>
      <p>(Cetak Ulang)</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  });

  // show currently called (visual)
  showCallBtn.addEventListener("click", ()=>{
    const lc = toInt(localStorage.getItem("antrian_lastCalled"), 0);
    if(lc <= 0) alert("Belum ada nomor dipanggil.");
    else alert("Sedang dipanggil: Nomor " + lc);
  });

  // initial: show myTicket if present
  const myTicket = sessionStorage.getItem("myTicket");
  if(myTicket){
    myTicketEl.innerText = "Nomor antrian Anda: " + myTicket;
  } else {
    myTicketEl.innerText = "Belum mengambil tiket";
  }

})();
