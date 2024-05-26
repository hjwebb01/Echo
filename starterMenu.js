// starterMenu.js

// Create a function to handle the play button click event
function handlePlayButtonClick() {
    // Redirect to index.html
    window.location.href = 'index.html';
}

// Create the menu page
function createMenuPage() {
    // Create the play button
    const playButton = document.createElement('button');
    playButton.textContent = 'Play';
    playButton.addEventListener('click', handlePlayButtonClick);

    // Append the play button to the body
    document.body.appendChild(playButton);
}

// Call the createMenuPage function to generate the menu page
createMenuPage();