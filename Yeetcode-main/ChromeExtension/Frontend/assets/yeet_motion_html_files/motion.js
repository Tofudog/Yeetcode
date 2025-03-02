document.addEventListener("DOMContentLoaded", function () {
    const playerName = localStorage.getItem('loser-username');
    document.getElementById("loser-text").textContent = playerName;
});