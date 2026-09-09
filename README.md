# The Chakna Point Admin PWA

## What this does
- Admin email/password login
- Live Firestore orders
- Order status: New → Accepted → Preparing → Ready → Delivered
- Customer name and address
- Items, quantities, subtotal, delivery and total
- COD/UPI payment status
- Add/edit/delete products
- Product price/category/photo/availability

## Firebase setup (one time)
1. Firebase Console → Authentication → Sign-in method → enable Email/Password.
2. Authentication → Users → Add user. Create your admin email and password.
3. Copy your admin email.
4. In `firestore.rules`, replace BOTH occurrences of `admin@example.com` with that exact email.
5. Firebase Console → Firestore Database → Rules → paste `firestore.rules` and Publish.
6. Customer app can continue using Anonymous Authentication.

Important: Do NOT put a Firebase service-account JSON/private key in this PWA.

## GitHub Pages
Upload all files in this folder to the admin repository root, then enable:
Settings → Pages → Deploy from branch → main → /(root)

Then open the Pages URL.

## First product data
You can add products from Admin → Products. The customer app must be updated to read the `products` collection if you want menu changes made here to appear automatically.
