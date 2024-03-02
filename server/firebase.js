import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getDatabase, ref, set, push, onValue } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyCO1USRky5fX_oMocDTHsqzUWKzkwlgcbU', // Use your actual API key
    authDomain: 'mathalino-ecf49.firebaseapp.com',
    projectId: 'mathalino-ecf49',
    storageBucket: 'mathalino-ecf49.appspot.com',
    messagingSenderId: '222445963426',
    appId: '1:222445963426:web:925820958a3a93d7edeffb',
    measurementId: 'G-SZY7DN7JTC'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM elements
const dashboard = document.querySelector('.dashboard');
const signInButton = document.getElementById('google');
const logOutButton = document.getElementById('log-out');

// Utility function to handle errors
function handleError(message, error) {
    console.error(`${message}:`, error);
}

// Sign in with Google
async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await updateUserDetails(user);
        showDashboard(user);
    } catch (error) {
        handleError('Authentication failed', error);
    }
}

// Update user details in Firebase Realtime Database
// Update user details in Firebase Realtime Database
async function updateUserDetails(user) {
  const userRef = ref(database, `users/${user.uid}`);
  
  try {
      // Fetch existing titles from Firebase
      const titlesSnapshot = await get(ref(database, `users/${user.uid}/titles`));
      const existingTitles = titlesSnapshot.val() || [];

      // Combine existing titles with the new user data
      const userData = {
          date: new Date().toISOString(),
          fullName: user.displayName,
          email: user.email,
          id: user.uid,
          titles: existingTitles
      };

      // Update user details
      await set(userRef, userData);
      localStorage.setItem('user', JSON.stringify(userData));
  } catch (error) {
      handleError('Failed to update user details', error);
  }
}


// Setup user dashboard
function setupDashboard(user) {
    dashboard.style.right = '0';
    document.getElementById('user').textContent = `Sign in as ${user.displayName}`;

    const titlesRef = ref(database, `users/${user.uid}/titles`);
    const textBox = document.getElementById('text-box');
    const saveButton = document.getElementById('save');

    // Listen for title changes and update the UI accordingly
    onValue(titlesRef, (snapshot) => {
        const titles = [];
        snapshot.forEach((childSnapshot) => {
            titles.push(childSnapshot.val().title);
        });
        updateTitleAndTextBox(titles, user.uid);
    });

    saveButton.onclick = () => saveTitle(textBox.value, user.uid);
}

// Save title to Firebase under a user-specific path with a unique key each time
async function saveTitle(titleText, uid) {
    const titlesRef = ref(database, `users/${uid}/titles`);
    try {
        await push(titlesRef, { title: titleText, timestamp: new Date().toISOString() });
    } catch (error) {
        handleError('Failed to save title', error);
    }
}

// Update title and text box
function updateTitleAndTextBox(titles, uid) {
    const title = document.getElementById('title');
    const textBox = document.getElementById('text-box');

    if (titles && titles.length > 0) {
        title.textContent = titles[titles.length - 1]; // Display the latest title
        textBox.value = ''; // Clear the text box after displaying the title
    } else {
        setDefaultValues();
    }
}

// Set default values
function setDefaultValues() {
    const title = document.getElementById('title');
    title.textContent = 'No Existing Data from Firebase';
    textBox.value = '';
}

// Show the user dashboard
function showDashboard(user) {
    setupDashboard(user);
}

// Main
document.addEventListener('DOMContentLoaded', () => {
    signInButton.onclick = signInWithGoogle;

    auth.onAuthStateChanged((user) => {
        if (user) {
            showDashboard(user);
        }
    });

    logOutButton.onclick = () => {
        signOut(auth).catch((error) => {
            handleError('Sign out failed', error);
        });
    };
});


document.addEventListener('DOMContentLoaded', () => {
  signInButton.onclick = signInWithGoogle;

  auth.onAuthStateChanged((user) => {
      if (user) {
          showDashboard(user);
      } else {
          // Hide dashboard or adjust UI accordingly
          document.querySelector('.dashboard').style.right = '100%';
      }
  });

  logOutButton.onclick = signOutUser; // Attach logout functionality
});