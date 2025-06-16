export default function Contact() {
  return (
    <div className="container py-4">
      <h2>Contact Us</h2>
      <form className="mb-4">
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" id="name" className="form-control" required />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input type="email" id="email" className="form-control" required />
        </div>
        <div className="mb-3">
          <label htmlFor="message" className="form-label">Message</label>
          <textarea id="message" rows="4" className="form-control" required></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Send</button>
      </form>
      <p>Email: <a href="mailto:support@chashmagenie.com">support@chashmagenie.com</a></p>
      <p>Phone: +92 300 1234567</p>
      <p>Address: Lahore, Pakistan</p>
      <p>
        Instagram: <a href="https://instagram.com/chashmagenie" target="_blank" rel="noopener">@chashmagenie</a>
      </p>
    </div>
  )
}
