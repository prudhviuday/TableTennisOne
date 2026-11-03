# SpinCraft — Table Tennis Storefront

A responsive static storefront prototype for table-tennis equipment, with an interactive 3D custom-racket configurator.

## Pages

- `/` — landing page, featured products and custom-builder entry point.
- `/shop/` — product catalogue with category filters, search, price sorting and add-to-cart actions.
- `/builder/` — interactive WebGL racket configurator.
- `/login/` — account preview explaining that authentication is not connected yet.

## Custom racket builder

The builder uses Three.js (loaded from cdnjs) to render separate blade, handle, forehand-rubber and backhand-rubber meshes. Users can select the blade, each rubber, sponge thickness and handle shape, then rotate the racket, switch between its two faces and zoom the preview. The configuration price is recalculated as selections change.

## Cart and current limitations

- The shared cart is stored in the current browser's `localStorage` and is shared across the storefront pages.
- Checkout is intentionally a preview message. No payment gateway, order API, inventory service, shipping calculation or tax calculation is connected.
- Login is not implemented. The account page does not pretend to authenticate users.
- Product names, descriptions and prices are demonstration catalogue content and should be verified before selling.
- The 3D preview requires WebGL and access to the Three.js CDN. A readable fallback appears when WebGL/Three.js is unavailable.

## Deployment

The project is plain HTML, CSS and JavaScript. It can be deployed as a static site with the repository root as the output directory. Keep the `assets/` folder and its paths intact.
