document.addEventListener("DOMContentLoaded", () => {
    const confirmJoinButton = document.getElementById("confirm-join");

    const socket = new WebSocket("ws://localhost:3000/ws");

    confirmJoinButton.addEventListener("click", () => {
        const invCode = document.getElementById("inviteCode").value.trim();
        const player2Name = localStorage.getItem("leetcode_username");

        console.log("This is the invite code:", invCode);

        fetch("http://localhost:3000/api/games/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ invitation_code: invCode, username: player2Name })
        })
        .then(res => res.json())
        .then(data => {
            if (data.message) {
                alert(data.message);
            } else {
                localStorage.setItem("player2", player2Name);
                localStorage.setItem("gameId", data._id);
                localStorage.setItem("inviteCode", invCode);
                socket.send(JSON.stringify({ 
                    type: "PLAYER2_JOINED_send_1", 
                    gameId: data._id, 
                    inviteCode: invCode, // use inviteCode
                    player2: player2Name,
                    isPlayer1Api: localStorage.getItem("isPlayer1Api"), 
                    isPlayer2Api: localStorage.getItem("isPlayer2Api"),
                    player2: localStorage.getItem("player2")
                }));
                console.log("Player 2 joined, polling for game start...");
            }
        })
        .catch(err => console.error("Failed to join game:", err));
    });


    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data);
        if (data.type === "accepted_join_game_send_2") {
            console.log("Successfully joined game!");
            
        } else if (data.type === "player1_name_send_2") {
            console.log("Successfully got player1's name");
            localStorage.setItem("player1", data.player1);

        } else if(data.type === "GAME_STARTED_send_2") {
            window.location.href = "game-play-screen2.html"; 

        } else {
            console.warn("Unfamiliar socket type message:", data.type);
        }
    };
});