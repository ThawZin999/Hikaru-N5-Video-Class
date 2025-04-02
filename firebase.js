import admin from "firebase-admin";
import fs from "fs";

let serviceAccount;

try {
  // Read the Firebase credentials from a local JSON file
  serviceAccount = JSON.parse(
    fs.readFileSync(
      "./hikarun5bot-firebase-adminsdk-fbsvc-79e90f4047.json",
      "utf8"
    )
  );
} catch (error) {
  console.error("Error reading Firebase credentials file:", error);
  process.exit(1); // Exit if credentials are missing or invalid
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const usersCollection = db.collection("approvedUsers");

export { db, usersCollection };
