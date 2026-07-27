# Payment Checkout Status

CoolDrivePro currently uses a manual invoice request flow instead of an embedded online checkout provider.

## Current Customer Flow

1. Product detail buttons open the localized Contact page.
2. The Contact form is prefilled with the selected product, quantity, and an invoice request message.
3. The sales team confirms stock, shipping, final total, and the available payment instructions before requesting payment.
4. Customers must not send full card numbers, CVV codes, or complete payment credentials by email, chat, or contact form.

## Code Paths

- Product buttons call `startCheckout` in `client/src/lib/checkout.ts`.
- The helper redirects to `/contact/?intent=invoice&productId=...&quantity=...`.
- The Contact page pre-fills the request from those query parameters.
- The worker keeps the legacy `/api/create-checkout-session` and `/api/create-payment-link` routes as a safe fallback that returns the same Contact URL instead of calling a payment provider.

## Before Re-Enabling Online Card Checkout

1. Confirm the provider can support the legal entity, payout country, product category, website policies, and target markets.
2. Confirm available card brands, settlement currency, chargeback handling, and prohibited-product terms.
3. Add provider secrets in Cloudflare Pages only after sandbox testing succeeds.
4. Update the Payment Method, Privacy Policy, footer badges, and product order block to name only the active provider and accepted methods.
5. Run `npm run build` and test a sandbox checkout end to end before deploying.