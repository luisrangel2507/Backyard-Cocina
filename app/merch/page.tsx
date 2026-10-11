export default function Merch() {
  return (
    <section className="merch">
      <div className="mh"><h2>MERCH</h2><span className="soon">Under construction</span></div>
      <div className="tape" aria-hidden="true" />
      <div className="mgrid">
        {[["👕", "Tees"], ["🧢", "Hats"], ["👜", "Totes"]].map(([i, n]) => (
          <div className="mi" key={n}><span>{i}</span><b>{n}</b></div>
        ))}
      </div>
      <p>Backyard Cocina shirts, hats and more are on the way. Check back soon.</p>
      <a className="btn" href="/shop">Order salsas</a>
    </section>
  );
}
