import products from '../data.json'

export default function Products() {
  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">Products</h2>
      <div className="row g-3">
        {products.map((p, idx) => (
          <div className="col-md-4" key={idx}>
            <div className="card h-100 shadow-sm">
              <img src={p.image} className="card-img-top" alt={p.name} />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{p.name}</h5>
                <p className="card-text fw-bold">{p.price}</p>
                <a className="btn btn-success mt-auto" target="_blank" rel="noopener" href="https://instagram.com/chashmagenie">
                  Order on Instagram
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
