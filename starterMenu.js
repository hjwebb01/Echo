// Import necessary modules if needed

// Create a function to handle the Start button click event
function startButtonClicked() {
    // Redirect to main.js
    window.location.href = 'main.js';
}

// Create the menu HTML elements
const menuContainer = document.createElement('div');
menuContainer.classList.add('menu-container');

const headerText = document.createElement('h1');
headerText.textContent = 'ECHO';

const startButton = document.createElement('button');
startButton.textContent = 'Start';
startButton.addEventListener('click', startButtonClicked);

// Append the elements to the document body
menuContainer.appendChild(headerText);
menuContainer.appendChild(startButton);
document.body.appendChild(menuContainer);