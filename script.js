// Twitch API credentials
const clientId = 'nxkakhie3pxhk5vir4hp31h7mno3k2';
const broadcasterId = '836503784'; // Replace with your Broadcaster ID
const hardcodedAccessToken = 'untlp3augfcndztci64hndmjn2dvc6'; // Hardcoded access token for testing

let dailyCount = 0; // Initialize daily count

// Function to validate the access token
async function validateAccessToken() {
    try {
        const response = await fetch('https://id.twitch.tv/oauth2/validate', {
            headers: {
                Authorization: `Bearer ${hardcodedAccessToken}`,
            },
        });

        const data = await response.json();

        console.log('Token Validation Response:', data); // Log validation response

        if (data.scopes.includes('channel:read:subscriptions')) {
            return true; // Token is valid and has the required scope
        } else {
            throw new Error('Access token does not have the required scope: channel:read:subscriptions');
        }
    } catch (error) {
        console.error('Error validating access token:', error);
        return false;
    }
}

// Function to fetch total subscriber count
async function getTwitchSubCount() {
    try {
        const isValidToken = await validateAccessToken();
        if (!isValidToken) {
            throw new Error('Invalid or missing token scope.');
        }

        const subResponse = await fetch(
            `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${broadcasterId}`,
            {
                headers: {
                    'Client-ID': clientId,
                    Authorization: `Bearer ${hardcodedAccessToken}`,
                },
            }
        );

        const subData = await subResponse.json();

        console.log('Subscriber Data Response:', subData); // Log subscriber data

        if (subData.error) {
            throw new Error(`Twitch API Error: ${subData.message}`);
        }

        if (subData.total !== undefined) {
            return subData.total; // Return total subscriber count
        } else {
            throw new Error('Subscriber count not found in response');
        }
    } catch (error) {
        console.error('Error fetching subscriber count:', error);
        return 0; // Return 0 on failure
    }
}

// Function to reset the daily subscription counter
function resetDailyCounter() {
    const lastReset = localStorage.getItem('lastResetTime');
    const now = new Date().getTime();

    // Check if 24 hours have passed
    if (!lastReset || now - lastReset > 24 * 60 * 60 * 1000) {
        dailyCount = 0; // Reset the daily count
        localStorage.setItem('lastResetTime', now); // Update the reset timestamp
        console.log('Daily counter reset.');
    }
}

// Function to update the goal bar
async function updateGoalBar(total) {
    try {
        resetDailyCounter(); // Reset the daily counter if 24 hours have passed

        const progressBar = document.querySelector('.goal-bar-progress');
        const progressText = document.querySelector('.goal-progress-text');
        const centerText = document.querySelector('.goal-progress-center-text');

        const subCount = await getTwitchSubCount();

        // Calculate the percentage of the goal completed
        const percentage = Math.min((dailyCount / total) * 100, 100);

        // Update the progress bar's width but stop at 100%
        progressBar.style.width = `${percentage}%`;

        // Update the counter text for daily progress
        progressText.textContent = `${dailyCount} / ${total}`;

        // Update the center text with the total subscriber count
        centerText.textContent = `Total: ${subCount}`;

        // Smooth color gradient transitions for progress text
        const hue = Math.round((120 * percentage) / 100); // From red (0) to green (120)
        progressText.style.color = `hsl(${hue}, 100%, 50%)`; // Hue-based color
    } catch (error) {
        console.error('Error updating goal bar:', error);
        const centerText = document.querySelector('.goal-progress-center-text');
        centerText.textContent = 'Error Fetching Data';
    }
}

// Function to continuously update the subscription count every 5 seconds
function startUpdatingSubCount(interval = 5000) {
    updateGoalBar(25); // Initial call with the goal (25 in this case)
    setInterval(() => {
        updateGoalBar(25); // Repeatedly call every interval
    }, interval);
}

// Start updating every 5 seconds
startUpdatingSubCount();



//const subCount = current; // Use THIS for testing to see if Progress Bar and Counters are working as expected.