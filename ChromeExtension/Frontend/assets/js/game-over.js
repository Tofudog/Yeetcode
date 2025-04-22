document.addEventListener('DOMContentLoaded', function() {
    // Get player names from localStorage
    const player1 = localStorage.getItem('player1');
    const player2 = localStorage.getItem('player2');

    console.log(`Player 1 is ${player1}`);
    console.log(`Player 2 is ${player2}`);

    // Update player names in the UI
    const player1Element = document.getElementById('player1-game-over-text');
    const player2Element = document.getElementById('player2-game-over-text');
    
    player1Element.innerText = player1;
    player2Element.innerText = player2;

    // Handle back button click
    const backButton = document.getElementById('back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            // Clear game-specific data from localStorage
            //localStorage.clear();
            
            // Navigate back to the main screen
            window.location.href = 'main-screen.html';
        });
    }
}); 