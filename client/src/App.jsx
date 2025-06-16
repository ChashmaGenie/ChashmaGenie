import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import products from './data.json';

function App() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => {
    const price = parseInt(item.price.replace(/[^0-9]/g, ''));
    return sum + price;
  }, 0);

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-center text-primary">ChashmaGenie Store</h1>
      <div className="row">
        <div className="col-md-8">
          <div className="row g-3">
            {products.map((p, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="card h-100 shadow-sm">
                  <img src={p.image} className="card-img-top" alt={p.name} />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{p.name}</h5>
                    <p className="card-text fw-bold">{p.price}</p>
                    <button className="btn btn-success mt-auto" onClick={() => addToCart(p)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="col-md-4">
          <h2>Cart</h2>
          {cart.length === 0 && <p>No items added.</p>}
          <ul className="list-group mb-3">
            {cart.map((item, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                {item.name}
                <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(index)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
          {cart.length > 0 && (
            <div className="alert alert-info">
              <strong>Total:</strong> Rs. {total}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
