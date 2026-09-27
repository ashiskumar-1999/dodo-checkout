# Dodo-checkout

A embeddable checkout integration with three parts: a product demo site, an embeddable browser SDK, and a checkout page. Payments are simulated; no payment processor is connected.

## Run Locally

Install dependencies from the workspace root:

```bash
npm --prefix checkout install
npm --prefix sdk install
npm --prefix demo-Site install
```

Start the checkout app and demo site in separate terminals:
```
npm --prefix checkout run dev
npm --prefix demo-Site run dev
```

Open the demo at http://localhost:3001. The checkout runs at http://localhost:3000. Starting the demo builds the SDK and copies its browser bundle into the demo site's public directory.

## How It Works
- The demo storefront loads the SDK bundle and calls:
```
window.DodoCheckout.open({
  productId,
  productName,
  amount,
  onSuccess,
  onError,
  onClose
});
```
- The SDK creates a modal overlay and injects an iframe pointing at the checkout app URL.

- The SDK sends a message to the checkout iframe:
```
{
  source: "dodo-checkout-sdk",
  type: "DODO_CHECKOUT_INIT",
  productId,
  productName,
  amount
}
```
- The checkout app receives that message, initializes the purchase flow, and responds with:

   - DODO_CHECKOUT_READY
   - DODO_CHECKOUT_SUCCESS
   - DODO_CHECKOUT_CLOSE
   - DODO_CHECKOUT_ERROR
- The SDK listens to those postMessage events and triggers the matching callbacks on the storefront:

   - onSuccess
   - onClose
   - onError
- This keeps the storefront simple while the actual payment/checkout logic runs in the embedded checkout app.

## Important behavior
- The demo site rebuilds the SDK before starting so the latest bundle is copied into public/dodo-checkout.js.
- The SDK validates the checkout URL and only allows secure URLs (https://) or localhost.
- The checkout runs inside an iframe to keep the purchase flow isolated from the storefront UI.

## Project structure

```
dodo-checkout/
├── checkout/
├── demo-Site/
├── sdk/
├── README.md
```



