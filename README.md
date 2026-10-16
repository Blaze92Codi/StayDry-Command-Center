# StayDry Command V1

Local template-based draft generation. No Anthropic subscription, API key or external model call is used.

Run npm install, then npm run dev. Drafts require human review before customer delivery. The API rejects missing or foreign origins and invalid input. Set PALMER_SECURITY_PAUSED=true in the host environment to pause generation. This is an incoming-request boundary, not an outbound firewall or customer-message approval service.

Run node --test test-security.mjs and the security/ baseline checks before release. No messages are sent by this application.
