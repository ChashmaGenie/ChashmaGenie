const toggle = document.getElementById('menuToggle');
const nav = document.getElementById('navbarMenu');

if (toggle) {
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('productGrid');
  if (grid) {
    fetch('assets/data/products.json')
      .then(res => res.json())
      .then(products => {
        grid.innerHTML = products.map(p => `
          <div class="product">
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>${p.price}</p>
            <button>Add to Cart</button>
          </div>
        `).join('');
      })
      .catch(() => {
        grid.innerHTML = '<p>Unable to load products.</p>';
      });
  }
});
