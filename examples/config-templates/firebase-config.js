// Configuración de Firebase para aplicaciones web
// Reemplaza los valores YOUR_* con los valores reales de tu nuevo proyecto Firebase

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID", // Opcional: para Google Analytics
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com/" // Opcional: para Realtime Database
};

// Para aplicaciones ES6/TypeScript
export default firebaseConfig;

// Para aplicaciones CommonJS
// module.exports = firebaseConfig;