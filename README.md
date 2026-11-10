# Rahul Housekeeping Website

A responsive static business website for Rahul Housekeeping, Deoghar, Jharkhand.

## Repository structure

```text
rahul-housekeeping/
├── index.html
├── README.md
├── .nojekyll
├── assets/
│   ├── favicon.svg
│   └── logo.svg
├── css/
│   └── style.css
└── js/
    ├── main.js
    └── products.js
```

## Deploy with GitHub Pages

1. Upload **all files and folders** in this project to the root of your GitHub repository.
2. Open the repository on GitHub.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main** and folder **/(root)**.
6. Click **Save**.
7. Wait for GitHub Pages to finish deploying. The published URL will appear in Settings → Pages.

Do not upload only `index.html`. The CSS, JavaScript and assets folders are required.

## Add products

Edit `js/products.js`. Add one object per verified product:

```js
window.RAHUL_PRODUCTS = [
  {
    name: "Verified product name",
    category: "Plastic Household Products",
    description: "Short factual description.",
    image: "assets/products/verified-product.jpg"
  }
];
```

Allowed category values:

- `Plastic Household Products`
- `Cleaning & Housekeeping`
- `Storage & Organization`
- `Household Furniture`
- `Other Household Essentials`

To use local product images:

1. Create `assets/products/`.
2. Add the product image files there.
3. Reference each image with a relative path such as `assets/products/bucket.jpg`.
4. Commit and push the changes.

Do not add guessed product names or claim an item is in stock without confirming it with Rahul.

## Before publishing

Verify these business details with Rahul:

- Phone: `8539994074`
- Address: `Shyam Ganj Road, Shivganga Muhalla, Deoghar, Jharkhand – 814112`
- GSTIN: `20FQOPR8559E1ZC`
- Opening hours: Every day, 9:00 AM–9:00 PM
- Google Maps listing: https://maps.app.goo.gl/JowvbVJHZ4s5Y6Sr8

The Google Maps link is used for directions and the reviews link. The review section intentionally does not display invented review text or ratings. Add selected genuine reviews only after verifying them.

## Notes

- No cart, checkout, payment gateway, login or admin dashboard.
- Product prices are enquiry-based and are not displayed.
- The main Call Now buttons use the business phone number.
- Category and hero photography is illustrative stock imagery loaded from Unsplash. It must not be represented as exact current inventory.
- This is a static site. Changes take effect after committing/pushing updated files to the GitHub repository.
