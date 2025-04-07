// Function to save profile changes
async function saveProfileChanges() {
    const bio = document.getElementById('player-bio').textContent;
    const university = document.getElementById('university').textContent;
    
    try {
        // Here you would typically make an API call to save the changes
        // For now, we'll just save to localStorage
        const currentPlayer = localStorage.getItem('currentPlayer');
        const profileData = {
            bio,
            university,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(`profile_${currentPlayer}`, JSON.stringify(profileData));
        alert('Profile updated successfully!');
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving changes. Please try again.');
    }
}

// Function to update profile data
async function updateProfileData() {
    try {
        // Get the current player from localStorage
        const currentPlayer = localStorage.getItem("currentPlayer");
        
        if (!currentPlayer) {
            console.error("No player found in localStorage");
            return;
        }

        // Get saved profile data if it exists
        const savedProfileData = localStorage.getItem(`profile_${currentPlayer}`);
        const profileData = savedProfileData ? JSON.parse(savedProfileData) : null;

        // In a real implementation, you would fetch this data from your backend
        const userData = {
            username: currentPlayer,
            elo: 2632,
            title: 'Grandmaster',
            bio: profileData?.bio || 'CS370 is my favorite class!',
            problemsSolved: 1256,
            university: profileData?.university || 'Emory University'
        };

        // Update DOM elements with user data
        document.getElementById('leetcode-username').textContent = userData.username;
        document.getElementById('elo-rating').textContent = userData.elo;
        document.getElementById('player-title').textContent = userData.title;
        document.getElementById('player-bio').textContent = userData.bio;
        document.getElementById('problems-solved').textContent = userData.problemsSolved;
        document.getElementById('university').textContent = userData.university;

    } catch (error) {
        console.error('Error updating profile data:', error);
    }
}

// Handle back button click
document.getElementById('back-button').addEventListener('click', () => {
    window.history.back();
});

// Handle save button click
document.getElementById('save-profile').addEventListener('click', saveProfileChanges);

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateProfileData();
});
