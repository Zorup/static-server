importScripts('https://www.gstatic.com/firebasejs/5.9.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.9.2/firebase-messaging.js');

// Initialize Firebase Service Worker
let firebaseConfig = {
    apiKey: "AIzaSyDcO66arFwaWHVYAWpGciqGGQV9cOGJM2Q",
    authDomain: "alarm-1830c.firebaseapp.com",
    projectId: "alarm-1830c",
    storageBucket: "alarm-1830c.appspot.com",
    messagingSenderId: "831418413127",
    appId: "1:831418413127:web:d4fc457e510db7556cc162",
    measurementId: "G-6YP6W2WJ89"
};
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();