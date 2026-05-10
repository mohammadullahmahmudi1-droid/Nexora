# Nexora Security Specification

## Data Invariants
- A user cannot modify their own role.
- A user can only read their own chats and messages.
- Ads can only be modified by admins.
- AI messages must be tagged correctly.

## The Dirty Dozen Payloads (Attempts to break rules)
1. **Identity Spoofing**: User A tries to create a chat for User B.
2. **Privilege Escalation**: User A tries to update their role to 'admin'.
3. **Data Integrity**: User A tries to post a message with sender set as 'admin'.
4. **Resource Poisoning**: User A tries to create a chat with a 1MB string in document ID.
5. **PII Leak**: User A tries to read User B's profile.
6. **Bypassing Invariants**: User A tries to update `createdAt` timestamp.
7. **Ad Hijacking**: User A tries to deactivate an ad.
8. **Shadow Field**: User A tries to add 'isVerified: true' to their profile.
9. **Orphaned Message**: User A tries to post a message to a chat that doesn't exist (though Firestore doesn't strictly prevent this without `get()` check).
10. **Admin Identity Spoof**: Someone tries to create a doc in `/admins/` to gain access.
11. **Query Scrape**: Authenticated user tries to list ALL chats regardless of ownership.
12. **Malicious Image**: User A tries to set a 1MB string as a photo URL.

## Rule Enforcement
The `firestore.rules` will specifically use `affectedKeys().hasOnly()` and `isValid[Entity]` to block these.
