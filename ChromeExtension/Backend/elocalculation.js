class Player {
    constructor(elo = 1500, rd = 50) {
        this.elo = elo;        // Base ELO rating (default 1500)
        this.rd = rd;          // Rating Deviation (default 50)
        this.gamesPlayed = 0;  // Track number of games played
    }
    
    /**
     * Updates player rating based on game results
     * @param {number} result - 1 for win, 0 for loss
     * @param {number} opponentElo - Opponent's ELO
     * @returns {number} - The new ELO rating
     */
    updateRating(result, opponentElo) {
        // RD sequence decreases as player gains experience
        
        // Calculate rating difference
        let eloDiff = Math.abs(this.elo - opponentElo);
        
        // Base rating change is 8 for ratings within 25 points
        let baseChange = 8;
        
        // For every 25 points difference beyond the initial 25, add 1
        if (eloDiff > 25) {
            let additionalPoints = Math.floor((eloDiff - 25) / 25);
            baseChange += additionalPoints;
        }
        
        // Apply win/loss multiplier
        baseChange *= (result === 1 ? 1 : -1);
        
        // Calculate final rating change
        let ratingChange = Math.round(baseChange);
        
        // Update rating
        this.elo = Math.round(this.elo + ratingChange);
        this.gamesPlayed++;
        
        return this.elo;
    }
}

/**
 * Simulation function to test the ELO rating system
 * Creates two players and simulates 10 games with random results
 */
function simulate() {
    let player1 = new Player(1500, 20);
    let player2 = new Player(1500, 20);
    console.log(`Starting: Player 1 Elo = ${player1.elo}, RD = ${player1.rd}`);
    console.log(`Starting: Player 2 Elo = ${player2.elo}, RD = ${player2.rd}`);

    for (let i = 1; i <= 10; i++) {
        let result = Math.random() > 0.5 ? 1 : 0; // Random win/loss
        
        // Update both players' ratings
        player1.updateRating(result, player2.elo);
        player2.updateRating(1 - result, player1.elo);
        
        let outcome = result === 1 ? "Player 1 Wins" : "Player 2 Wins";
        console.log(`Game ${i}: ${outcome}, Player 1 Elo = ${player1.elo}, Player 2 Elo = ${player2.elo}`);
    }
}

simulate();
