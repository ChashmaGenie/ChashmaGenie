export default function Home() {
  return (
    <div>
      <section className="text-center py-5 bg-primary text-white" style={{backgroundImage: 'url(https://placehold.co/1200x400?text=ChashmaGenie)', backgroundSize:'cover'}}>
        <div className="container">
          <h1 className="display-4 fw-bold">Your Vision, Our Mission</h1>
          <p className="lead">Quality eyewear for everyone in Pakistan.</p>
        </div>
      </section>
      <section className="container py-5">
        <div className="row g-4">
          <div className="col-md-4 text-center">
            <h3>Trendy Frames</h3>
            <p>Discover the latest frame styles handpicked for you.</p>
          </div>
          <div className="col-md-4 text-center">
            <h3>Affordable Prices</h3>
            <p>Premium quality eyewear at pocket-friendly rates.</p>
          </div>
          <div className="col-md-4 text-center">
            <h3>Nationwide Delivery</h3>
            <p>Get your glasses delivered anywhere in Pakistan.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
