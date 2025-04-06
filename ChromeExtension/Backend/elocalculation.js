/**
 * Player class implementing an enhanced ELO rating system with multiple factors
 * for competitive programming games. The system considers:
 * - Question completion rate
 * - Problem difficulty
 * - Time taken
 * - Player inactivity
 * - Rating deviation (RD) for volatility
 */
class Player {
  constructor(elo = 1500, rd = 50) {
      this.elo = elo;        // Base ELO rating (default 1500)
      this.rd = rd;          // Rating Deviation (default 50)
      this.gamesPlayed = 0;  // Track number of games played
      this.lastActive = Date.now();  // Last active timestamp
  }

  expectedScore(opponentElo) {
      return this.elo;
  }
  
  /**
   * Updates player rating based on game results and performance factors
   * @param {number} result - 1 for win, 0 for loss
   * @param {number} hoursInactive - Hours since last activity
   * @param {number} questions - Total questions in the game
   * @param {number} questionsSolved - Number of questions solved
   * @param {string} difficulty - Problem difficulty level ('easy', 'medium', 'hard')
   * @param {number} time - Time taken in minutes
   */
  updateRating(result, hoursInactive, questions, questionsSolved, difficulty, time) {
      // RD sequence decreases as player gains experience
      const rdSequence = [20, 15, 12, 9, 6, 4, 3, 2, 1];
      let index = Math.min(this.gamesPlayed, rdSequence.length - 1);
      this.rd = rdSequence[index];
      
      // Question factor: Penalizes incomplete solutions
      let questionFactor = 1.0;
      if (result === 0) { // Player lost
        let unansweredQuestions = questions - questionsSolved;
        if (questionsSolved === 0) {
          questionFactor = 1.2;  // Maximum penalty for no solutions
        } else if (questionsSolved === unansweredQuestions) {
          questionFactor = 0.8;  // Reduced penalty for solving all questions
        } else {
          questionFactor = 1 + (unansweredQuestions / questions) * 0.5; // Proportional penalty
        }
      }
      
      // Difficulty factor: Rewards solving harder problems
      let difficultyFactor = 1.0;
      if (difficulty === "easy") {
        difficultyFactor = 0.8;    // Reduced impact for easy problems
      } else if (difficulty === "medium") {
        difficultyFactor = 1.0;    // Standard impact for medium problems
      } else if (difficulty === "hard") {
        difficultyFactor = 1.2;    // Increased impact for hard problems
      }
      
      // Time factor: Penalizes slower solutions
      let timeFactor = 0.5;  // Base time factor
      if (time > 5) {
        // For every 5 minutes above 5, add 0.05 to the time factor, up to 120 minutes
        let additionalTime = Math.min(time - 5, 115); // Cap at 120 minutes
        let additionalFactor = (additionalTime / 5) * 0.05;
        timeFactor += additionalFactor;
      }
      
      // Calculate final rating change with all factors
      let ratingChange = Math.round(
        this.rd * 15 * (result === 1 ? 1 : -1) * questionFactor * difficultyFactor * timeFactor
      );
      
      this.elo = Math.round(this.elo + ratingChange);
      this.gamesPlayed++;
      this.lastActive = Date.now();
      this.handleInactivity(hoursInactive);
    }
  
  /**
   * Handles player inactivity by adjusting RD
   * @param {number} hoursInactive - Hours since last activity
   */
  handleInactivity(hoursInactive) {
      if (hoursInactive > 0) {
          let weeksInactive = Math.floor(hoursInactive / (7 * 24));
          this.rd = Math.min(50, this.rd + 3 * weeksInactive);  // Increase RD by 3 per week inactive
      }
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
      let result = 1; 
      let hoursInactive = 0;
      let questionsSolved = Math.floor(Math.random() * 3);
      
      player1.updateRating(player2, result, hoursInactive, questionsSolved);
      let outcome = result === 1 ? "Player 1 Wins" : "Player 2 Wins";
      console.log(`Game ${i}: ${outcome}, Questions Solved = ${questionsSolved}, Player 1 Elo = ${Math.round(player1.elo)}, RD = ${Math.round(player1.rd)}, Player 2 Elo = ${Math.round(player2.elo)}, RD = ${Math.round(player2.rd)}`);
  }

  let hoursInactive = 7 * 24 * 4; 
  player1.handleInactivity(hoursInactive);
  player2.handleInactivity(hoursInactive);
  console.log(`After ${hoursInactive / (7 * 24)} weeks inactive: Player 1 Elo = ${Math.round(player1.elo)}, RD = ${Math.round(player1.rd)}, Player 2 Elo = ${Math.round(player2.elo)}, RD = ${Math.round(player2.rd)}`);
}

simulate();
