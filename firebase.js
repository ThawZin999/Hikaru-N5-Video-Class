import admin from "firebase-admin";

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
} catch (error) {
  console.error("Error parsing Firebase credentials:", error);
  process.exit(1); // Exit the process if credentials are invalid
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const usersCollection = db.collection("approvedUsers");

export { db, usersCollection };
