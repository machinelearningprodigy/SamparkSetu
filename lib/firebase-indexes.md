# Firebase Indexes Setup Guide

To ensure optimal performance for the messaging system, you need to set up composite indexes in Firebase Firestore. Follow these steps:

## Required Indexes  

1. **Messages Collection - For conversation queries**:
   - Fields: `sender_id` (Ascending), `receiver_id` (Ascending), `created_at` (Descending)
   - Query scope: Collection

2. **Messages Collection - For item-specific messages**:
   - Fields: `item_id` (Ascending), `created_at` (Descending)
   - Query scope: Collection

3. **Messages Collection - For category filtering**:
   - Fields: `category` (Ascending), `created_at` (Descending)
   - Query scope: Collection

4. **Messages Collection - For sender with category**:
   - Fields: `sender_id` (Ascending), `category` (Ascending), `created_at` (Descending)
   - Query scope: Collection

5. **Messages Collection - For receiver with category**:
   - Fields: `receiver_id` (Ascending), `category` (Ascending), `created_at` (Descending)
   - Query scope: Collection

## How to Create Indexes

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database in the left sidebar
4. Click on the "Indexes" tab
5. Click "Add Index" button

For each index listed above:
- Select the collection ("messages")
- Add each field with the specified order (Ascending/Descending)
- Set the Query scope to "Collection"
- Click "Create"

## Automatic Index Creation

Alternatively, you can let Firebase create indexes automatically:

1. Run your application with the messaging functionality
2. When you see an error in the console about missing indexes, it will include a direct link
3. Click the link to automatically create the required index in the Firebase Console

Example error message:
\`\`\`
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/project/your-project/database/firestore/indexes?create_index=...
\`\`\`

## Index Status

After creating indexes, they may take a few minutes to build. You can check their status in the Firebase Console under the "Indexes" tab.
