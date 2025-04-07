// Define the options for the pickers
const problemOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const timeOptions = [5, 10, 15, 20, 30, 60];

const BACKEND_API = "https://yeetcode-1.onrender.com";
const socket = new WebSocket(BACKEND_API.replace(/^http/, "ws") + "/ws");

// Add connection state tracking
let isSocketConnected = false;

socket.onopen = () => {
    console.log("WebSocket connected");
    isSocketConnected = true;
};

socket.onclose = () => {
    console.log("WebSocket disconnected");
    isSocketConnected = false;
};

// Helper function to send WebSocket messages
function sendWebSocketMessage(message) {
    if (isSocketConnected) {
        socket.send(JSON.stringify(message));
    } else {
        console.log("WebSocket not connected, retrying in 1 second...");
        setTimeout(() => sendWebSocketMessage(message), 1000);
    }
}

// Function to dynamically generate picker items
function generatePickerItems(pickerId, options, formatFn = (val) => val) {
  const pickerItemsContainer = document.querySelector(`#${pickerId} .picker-items`);
  pickerItemsContainer.innerHTML = ''; // Clear any existing items
  options.forEach(option => {
    const item = document.createElement('div');
    item.className = 'picker-item';
    item.setAttribute('data-value', option);
    item.textContent = formatFn(option);
    pickerItemsContainer.appendChild(item);
  });
}

// Function to update the centered value for a given picker element
function updateCenteredValue(pickerElement) {
  const rect = pickerElement.getBoundingClientRect();
  const centerY = rect.top + rect.height / 2;
  let closestDiff = Infinity;
  let centeredValue = null;
  
  pickerElement.querySelectorAll('.picker-item').forEach(item => {
    const itemRect = item.getBoundingClientRect();
    const itemCenterY = itemRect.top + itemRect.height / 2;
    const diff = Math.abs(centerY - itemCenterY);
    if (diff < closestDiff) {
      closestDiff = diff;
      centeredValue = item.getAttribute('data-value');
    }
  });
  
  if (centeredValue !== null) {
    pickerElement.setAttribute('data-value', centeredValue);
  }
}

// Attach a debounced scroll listener to update the centered value when scrolling stops
function attachScrollListener(pickerElement) {
  let scrollTimeout;
  pickerElement.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      updateCenteredValue(pickerElement);
    }, 100);
  });
}

// Wait for the DOM content to load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize game settings
  let selectedDifficulty = "easy";
  let selectedBattleType = "friendly";
  let selectedProblems = 3;
  let selectedTime = 60;

  // Generate picker items
  generatePickerItems('problem-picker', problemOptions);
  generatePickerItems('time-picker', timeOptions, (val) => `${val} min`);
  
  // Attach scroll listeners and initialize the centered values
  document.querySelectorAll('.ios-picker').forEach(picker => {
    attachScrollListener(picker);
    updateCenteredValue(picker);
  });

  // Difficulty buttons
  const difficultyBtns = document.querySelectorAll('.difficulty-btn');
  difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      difficultyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDifficulty = btn.id.replace('-btn', '');
    });
  });
  
  // Battle type buttons
  const battleTypeBtns = document.querySelectorAll('.battle-type-btn');
  battleTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      battleTypeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedBattleType = btn.id.replace('-btn', '');
    });
  });

  // Start button
  const startBtn = document.getElementById("start-btn");
  if (startBtn) {
    startBtn.addEventListener("click", async function() {
      try {
        // Get game state from storage
        const gameState = await new Promise((resolve) => {
          chrome.storage.local.get(['gameState'], (result) => resolve(result.gameState));
        });

        if (!gameState) {
          console.log('No game state found');
          return;
        }

        // Get selected values
        const problemPicker = document.getElementById('problem-picker');
        const timePicker = document.getElementById('time-picker');
        const selectedProblems = parseInt(problemPicker.getAttribute('data-value'));
        const selectedTime = parseInt(timePicker.getAttribute('data-value'));
        const selectedDifficulty = document.querySelector('.difficulty-btn.active').id.replace('-btn', '');
        const selectedBattleType = document.querySelector('.battle-type-btn.active').id.replace('-btn', '');

        // Generate random questions based on difficulty
        const questions = generateRandomQuestions(selectedProblems, selectedDifficulty);

        // Create game configuration
        const gameConfig = {
          difficulty: selectedDifficulty,
          numProblems: selectedProblems,
          timeLimit: selectedTime,
          battleType: selectedBattleType,
          questions: questions
        };

        // Store game configuration
        chrome.storage.local.set({
          gameState: {
            ...gameState,
            config: gameConfig,
            status: 'in_progress'
          }
        });

        // Send START_GAME message to both players with the questions
        sendWebSocketMessage({
          type: 'START_GAME',
          gameId: gameState.gameId,
          config: gameConfig
        });

        // Navigate to game play screen
        window.location.href = 'game-play-screen.html';

      } catch (error) {
        console.log('Error starting game:', error);
        alert('Failed to start game. Please try again.');
      }
    });
  }

  // Function to generate random questions
  function generateRandomQuestions(numProblems, difficulty) {
    // This is a placeholder - you'll need to implement the actual question generation logic
    const questions = [];
    const difficultyMap = {
      'easy': 1,
      'medium': 2,
      'hard': 3
    };

    // For now, just generate placeholder questions
    for (let i = 0; i < numProblems; i++) {
      questions.push({
        id: `problem-${i + 1}`,
        title: `Problem ${i + 1}`,
        difficulty: difficulty,
        difficultyLevel: difficultyMap[difficulty],
        url: `https://leetcode.com/problems/placeholder-${i + 1}`
      });
    }

    return questions;
  }
});
  