# ChashmaGenie Static Site

This repository contains a multi-page static website for the **ChashmaGenie** brand. The site uses a custom theme and Google fonts to better serve visitors in Pakistan. It is fully responsive for mobile devices.

## Pages
- `index.html` - Landing page with hero section and features
- `about.html` - Information about the brand
- `products.html` - Product listings rendered via JavaScript
- `contact.html` - Contact details

CSS is located in `assets/css` and JavaScript in `assets/js`. Product data lives in `assets/data/products.json` and is rendered on the products page using JavaScript. Images use online placeholders so no binary files are stored in the repository. Google Fonts are loaded via CDN for improved typography.
Add more items to the catalog by editing `assets/data/products.json`.
## GitHub Pages
To publish the website on GitHub Pages:
1. Ensure the default branch contains the site files.
2. In the repository settings, enable GitHub Pages and select the branch (and folder, if any).
3. (Optional) Add a custom domain by creating a `CNAME` file with your domain name and configuring DNS.

After enabling GitHub Pages, your website will be accessible via the GitHub Pages URL or your custom domain.
