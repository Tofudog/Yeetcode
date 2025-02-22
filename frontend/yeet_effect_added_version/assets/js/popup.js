document.addEventListener("DOMContentLoaded", function () {

    // Only attach event listener if the button exists on the current page
    let back_to_main_button = document.getElementById("back-to-main-screen");
    if (back_to_main_button) {
        back_to_main_button.addEventListener("click", function () {
            window.location.href = "main-screen.html"; // Navigate back to main screen
        });
    }

    let create_team_button = document.getElementById("create-team-button");
    if (create_team_button) {
        create_team_button.addEventListener("click", function () {
            window.location.href = "create-team-screen.html"; // Navigate to Create Team page
        });
    }

    let join_team_button = document.getElementById("join-team-button");
    if (join_team_button) {
        join_team_button.addEventListener("click", function () {
            window.location.href = "join-team-screen.html"; // Navigate to Join Team page
        });
    }

});