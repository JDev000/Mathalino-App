import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getDatabase, ref, set, onValue } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js';

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

// Sign in with Google
async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        // This gives you a Google Access Token. You can use it to access the Google API.
        const user = result.user;
        // Update user details in the database
        await updateUserDetails(user);
        // Show user dashboard
        showDashboard(user);
    } catch (error) {
        console.error('Authentication failed:', error);
        // Handle Errors here.
    }
}

// Update user details in Firebase Realtime Database
async function updateUserDetails(user) {
    const userRef = ref(database, `users/${user.uid}`);
    const userData = {
        date: new Date().toISOString(),
        fullName: user.displayName,
        email: user.email,
        id: user.uid,
    };
    try {
        await set(userRef, userData);
        // Optionally, save user data locally for quick access or offline use
        localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
        console.error('Failed to update user details:', error);
    }
}

const dashboard = document.querySelector('.dashboard');
// Setup user dashboard
function setupDashboard(user) {
    dashboard.style.right = '0';
    document.getElementById('user').textContent = `Welcome, ${user.displayName}`;
  
    const titleRef = ref(database, `users/${user.uid}/title`);
    const textBox = document.getElementById('text-box');
    const saveButton = document.getElementById('save');
  
    onValue(titleRef, (snapshot) => {
      const data = snapshot.val();
      updateTitleAndTextBox(data, user.uid); // Pass the user's uid
    });
  
    saveButton.onclick = async () => {
      const titleText = textBox.value;
      await set(titleRef, titleText); // Save to Firebase
      localStorage.setItem(`title_${user.uid}`, titleText); // Save to localStorage with user identifier
    };
}

  
  
function updateTitleAndTextBox(data, uid) {
    const title = document.getElementById('title');
    const textBox = document.getElementById('text-box');
    
    let titleText = data;
    if (!titleText) {
      titleText = localStorage.getItem(`title_${uid}`); // Try to get title from localStorage with user identifier
      if (titleText) {
        // If title is retrieved from localStorage, update Firebase with the new title
        set(ref(database, `users/${uid}/title`), titleText);
      }
    }
  
    if (titleText) {
      title.textContent = titleText;
      textBox.value = titleText;
    } else {
      setDefaultValues();
    }
}

  function setDefaultValues() {
    const title = document.getElementById('title');
  
    title.textContent = 'No Existing Data from Firebase';
    // textBox.value = '';
  }
  
  // Show the user dashboard
  function showDashboard(user) {
    setupDashboard(user);
  }
  
  // Main
  document.addEventListener('DOMContentLoaded', () => {
    const signInButton = document.getElementById('google');
    signInButton.addEventListener('click', signInWithGoogle);
  
    auth.onAuthStateChanged((user) => {
      if (user) {
        showDashboard(user);
      }
    });

    
  });

 
 
   //log-out
   const logOut = document.querySelector('#log-out');
   logOut.addEventListener('click', signOutUser)

   function signOutUser() {
    signOut(auth).then(() => {
        // Sign-out successful.
        document.querySelector('.dashboard').style.right = '100%';
    }).catch((error) => {
        // An error happened.
        console.error('Sign out failed:', error);
    });
}