# The Chakna Point Admin

Android Admin App for The Chakna Point.

## Before building
1. Firebase Authentication: enable Email/Password.
2. Add a Firebase Web App and paste its config into `app/src/main/assets/firebase-config.js`.
3. Create Firestore collections: `admins`, `products`, `orders`, `customers`.
4. Create the admin user in Firebase Authentication.
5. Create `admins/<ADMIN_UID>` with `active: true`.
6. Deploy `firestore.rules`.

## Important
Admin login uses Email/Password, not SMS OTP, so the current Phone Auth billing problem does not block this app's development.

## Codemagic
The repository must contain the files in this ZIP at its root. `codemagic.yaml` is already included.
