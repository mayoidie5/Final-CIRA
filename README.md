
  # Comlab Issue Reporting App

  This is a code bundle for Comlab Issue Reporting App.
  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  
  ## Firebase Setup

  1. Create a Firebase project at https://console.firebase.google.com/ and enable **Authentication** (Email/Password) and **Firestore**.
  2. Add a Web app in Firebase and copy the config values.
  3. Create a `.env` or `.env.local` file in the project root with the following keys (replace values from your Firebase config):

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

  4. Install the Firebase SDK (already done in this branch):

```powershell
npm install firebase
```

  5. Start the dev server:

```powershell
npm run dev
```

  Notes: `AuthContext` is wired to Firebase Auth and Firestore. New users will receive a verification email on signup and a Firestore `users` document will be created for each user.

