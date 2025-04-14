document.addEventListener("DOMContentLoaded", function () {
    const loserName = localStorage.getItem('loser-username');
    const currentUser = localStorage.getItem('currentUser');
    
    // Display the name that got ripped
    document.getElementById("loser-text").textContent = loserName;
});

// Add click event listener for the continue button
document.addEventListener('DOMContentLoaded', function() {
    const continueButton = document.getElementById('continue-button');
    continueButton.addEventListener('click', function() {
        // Get the current user and loser name
        const loserName = localStorage.getItem('loser-username');
        const currentUser = localStorage.getItem('currentUser');
        
        // Navigate to the appropriate screen based on whether the current user won or lost
        if (currentUser === loserName) {
            window.location.href = '../../game-over-lose.html';
        } else {
            window.location.href = '../../game-over-win.html';
        }
    });
});