// login.js - login sederhana tanpa DB
(function(){
  const $ = id => document.getElementById(id);
  const loginBtn = $("loginBtn");

  loginBtn.addEventListener("click", doLogin);
  // allow Enter key
  ["username","password"].forEach(id=>{
    const el = document.getElementById(id);
    el.addEventListener("keypress", e=>{
      if(e.key === "Enter") doLogin();
    });
  });

  function doLogin(){
    const u = $("username").value.trim();
    const p = $("password").value;
    // default credentials (bisa ganti manual sebelum deploy)
    if(u === "admin" && p === "1234"){
      sessionStorage.setItem("loggedIn", "true");
      // ensure a default maxTickets exists
      if(!localStorage.getItem("antrian_maxTickets")) localStorage.setItem("antrian_maxTickets", 100);
      window.location.href = "admin.html";
    } else {
      alert("Login gagal. Cek username/password.");
    }
  }
})();
