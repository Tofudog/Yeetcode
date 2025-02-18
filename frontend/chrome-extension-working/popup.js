document.addEventListener("DOMContentLoaded", function () {
    // Get references to screens
    const mainScreen = document.getElementById("main-screen");
    const joinScreen = document.getElementById("join-screen");
    const createScreen = document.getElementById("create-screen");

    // Get references to buttons
    const joinTeamBtn = document.getElementById("join-team");
    const createTeamBtn = document.getElementById("create-team");
    const backToMainJoinBtn = document.getElementById("back-to-main-join");
    const backToMainCreateBtn = document.getElementById("back-to-main-create");
    const confirmJoinBtn = document.getElementById("confirm-join");
    const startGameBtn = document.getElementById("start-game");

    // Handle screen switching
    function showScreen(screen) {
        mainScreen.classList.remove("active");
        joinScreen.classList.remove("active");
        createScreen.classList.remove("active");

        screen.classList.add("active");
    }

    // Event listeners for navigation
    joinTeamBtn.addEventListener("click", () => showScreen(joinScreen));
    createTeamBtn.addEventListener("click", () => showScreen(createScreen));
    backToMainJoinBtn.addEventListener("click", () => showScreen(mainScreen));
    backToMainCreateBtn.addEventListener("click", () => showScreen(mainScreen));

    // Handle "Join Team" logic
    confirmJoinBtn.addEventListener("click", function () {
        const teamCode = document.getElementById("teamCodeInput").value.trim();
        if (teamCode) {
            console.log("Joining team with code:", teamCode);
            alert("Successfully joined team " + teamCode);
        } else {
            alert("Please enter a valid team code.");
        }
    });

    // Handle "Create Team" logic
    startGameBtn.addEventListener("click", function () {
        const playerName = document.getElementById("playerName").value.trim();
        const competitorName = document.getElementById("competitorName").value.trim();
        
        if (playerName && competitorName) {
            console.log("Game started with:", playerName, "vs", competitorName);
            alert(`Game started! ${playerName} vs ${competitorName}`);
        } else {
            alert("Please enter both player names.");
        }
    });
});
