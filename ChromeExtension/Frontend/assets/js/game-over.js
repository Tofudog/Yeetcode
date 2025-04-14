document.addEventListener('DOMContentLoaded', function() {
    // Get player names from localStorage
    const player1 = localStorage.getItem('Player1') || 'Player 1';
    const player2 = localStorage.getItem('Player2') || 'Player 2';

    // Update player names in the UI
    const players = document.querySelectorAll('.player');
    if (players.length >= 2) {
        players[0].textContent = player1;
        players[1].textContent = player2;
    }

    // Handle back button click
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            // Clear game-specific data from localStorage
            localStorage.removeItem('gameState');
            
            // Navigate back to the main screen
            window.location.href = 'main-screen.html';
        });
    }
}); 