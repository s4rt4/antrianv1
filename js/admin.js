(function(){
  const $ = id => document.getElementById(id);
  if(sessionStorage.getItem("loggedIn") !== "true"){
    alert("Anda harus login dulu!");
    window.location.href = "login.html";
  }

  const callBtn = $("callBtn");
  const repeatBtn = $("repeatBtn");
  const resetBtn = $("resetBtn");
  const saveMaxBtn = $("saveMaxBtn");
  const maxTicketsInput = $("maxTickets");
  const adminLastCalled = $("adminLastCalled");
  const adminLastTaken = $("adminLastTaken");
  const adminRemaining = $("adminRemaining");
  const logoutBtn = $("logoutBtn");
  const clockAdmin = $("clockAdmin");

  let lastCalled = parseInt(localStorage.getItem("antrian_lastCalled")) || 0;
  let audioQueue = []; // simpan file audio terakhir

  // ================= CLOCK =================
  function updateClock(){
    clockAdmin.innerText = new Date().toLocaleString();
  }
  setInterval(updateClock,1000); updateClock();

  // ================= STATS =================
  function renderStats(){
    const lastTaken = parseInt(localStorage.getItem("antrian_lastTaken")) || 0;
    lastCalled = parseInt(localStorage.getItem("antrian_lastCalled")) || 0;
    const maxT = parseInt(localStorage.getItem("antrian_maxTickets")) || 100;
    adminLastTaken.innerText = lastTaken>0?lastTaken:"—";
    adminLastCalled.innerText = lastCalled>0?lastCalled:"—";
    adminRemaining.innerText = Math.max(0, maxT-lastTaken);
  }
  setInterval(renderStats,1000); renderStats();

  // ================= AUDIO ENGINE =================
  function preloadSounds() {
    const base = "sounds/";
    const list = [
      "antrian-nomor.mp3","belumadaantrian.mp3","antrianhabis.mp3",
      "satu.mp3","dua.mp3","tiga.mp3","empat.mp3","lima.mp3","enam.mp3","tujuh.mp3","delapan.mp3","sembilan.mp3",
      "sepuluh.mp3","sebelas.mp3","duabelas.mp3","tigabelas.mp3","empatbelas.mp3","limabelas.mp3",
      "enambelas.mp3","tujuhbelas.mp3","delapanbelas.mp3","sembilanbelas.mp3",
      "duapuluh.mp3","tigapuluh.mp3","empatpuluh.mp3","limapuluh.mp3","enampuluh.mp3","tujuhpuluh.mp3",
      "delapanpuluh.mp3","sembilanpuluh.mp3",
      "seratus.mp3","duaratus.mp3","tigaratus.mp3","empatratus.mp3","limaratus.mp3"
    ];
    list.forEach(f=>{
      const a=new Audio(base+f);
      a.preload="auto";
    });
  }
  preloadSounds();

  function playSequence(files){
    if(!files || !files.length) return;
    let i=0;
    const audio = new Audio(files[i]);
    audio.play();
    audio.onended = function(){
      i++;
      if(i<files.length){
        const next = new Audio(files[i]);
        next.play();
        next.onended = audio.onended;
      }
    };
  }

  function numberToFile(n) {
    const units = {
      0:"nol",1:"satu",2:"dua",3:"tiga",4:"empat",5:"lima",6:"enam",7:"tujuh",8:"delapan",9:"sembilan",
      10:"sepuluh",11:"sebelas",12:"duabelas",13:"tigabelas",14:"empatbelas",15:"limabelas",16:"enambelas",
      17:"tujuhbelas",18:"delapanbelas",19:"sembilanbelas"
    };
    const tens = {
      20:"duapuluh",30:"tigapuluh",40:"empatpuluh",50:"limapuluh",
      60:"enampuluh",70:"tujuhpuluh",80:"delapanpuluh",90:"sembilanpuluh"
    };
    const hundreds = {
      100:"seratus",200:"duaratus",300:"tigaratus",400:"empatratus",500:"limaratus"
    };

    if(units[n]) return units[n];          // 0–19
    if(tens[n]) return tens[n];            // kelipatan 10
    if(hundreds[n]) return hundreds[n];    // kelipatan 100

    if(n < 100) {                          // 21–99
      const t = Math.floor(n/10)*10;
      const u = n%10;
      return `${tens[t]}-${units[u]}`;
    }

    if(n < 200) return `seratus-${numberToFile(n-100)}`;
    if(n < 300) return `duaratus-${numberToFile(n-200)}`;
    if(n < 400) return `tigaratus-${numberToFile(n-300)}`;
    if(n < 500) return `empatratus-${numberToFile(n-400)}`;
    if(n === 500) return "limaratus";

    return n.toString(); // fallback
  }

  function buildAudioFiles(num, lastTaken){
    if(lastTaken === 0) return ["sounds/belumadaantrian.mp3"];
    if(num > lastTaken) return ["sounds/antrianhabis.mp3"];

    let parts = numberToFile(num).split("-");
    let files = ["sounds/antrian-nomor.mp3"];
    parts.forEach(p=>{
      files.push(`sounds/${p}.mp3`);
    });
    return files;
  }

  // ================= BUTTONS =================
  callBtn.addEventListener("click", ()=>{
    const lastTaken = parseInt(localStorage.getItem("antrian_lastTaken"))||0;
    lastCalled = parseInt(localStorage.getItem("antrian_lastCalled"))||0;
    if(lastTaken<=lastCalled){
      playSequence(["sounds/belumadaantrian.mp3"]);
      return;
    }
    lastCalled++;
    localStorage.setItem("antrian_lastCalled", lastCalled);
    adminLastCalled.innerText = lastCalled;
    audioQueue = buildAudioFiles(lastCalled, lastTaken);
    playSequence(audioQueue);
  });

  repeatBtn.addEventListener("click", ()=>{
    if(!audioQueue.length){
      playSequence(["sounds/belumadaantrian.mp3"]);
    } else {
      playSequence(audioQueue);
    }
  });

  resetBtn.addEventListener("click", ()=>{
    if(!confirm("Reset semua antrian?")) return;
    localStorage.setItem("antrian_lastTaken",0);
    localStorage.setItem("antrian_lastCalled",0);
    renderStats();
  });

  saveMaxBtn.addEventListener("click", ()=>{
    const v=parseInt(maxTicketsInput.value);
    if(v>0){
      localStorage.setItem("antrian_maxTickets",v);
      alert("Max tiket disimpan: "+v);
    }
  });

  logoutBtn.addEventListener("click", ()=>{
    sessionStorage.removeItem("loggedIn");
    window.location.href="login.html";
  });

})();
