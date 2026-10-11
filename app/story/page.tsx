export default function Story() {
  return (
    <>
      <section className="story">
        <img src="/founder.jpg" alt="Brant Fedor hugging his cat" style={{ width: 180, height: 180, borderRadius: "50%", objectFit: "cover", border: "5px solid var(--cream)" }} />
<p className="eyebrow">How it started</p>
<h2>My name is Brant Fedor and our story started here</h2>
<p className="lead">My Mexican friends brought me to their tables. Years in restaurant kitchens taught me to get it right. Now I deliver my backyard salsas to your door, or you can pick them up.</p>
<a className="btn shopbtn" href="/shop">Order now</a>
<ol className="trad">
<li><b>Friends</b><span>My Mexican friends invited me to family dinners, taquizas and Sunday carne asadas. I fell in love with the food and the traditions around it.</span></li>
<li><b>Kitchens</b><span>My years working in restaurants gave me the technique. I tested and adjusted each recipe until it tasted like the ones my friends grew up with.</span></li>
<li><b>Backyard</b><span>I roasted chiles on the grill and made salsa in my own patio for friends. They kept asking for more jars. That is how Backyard Cocina was born. Now I deliver to your door or you can pick up.</span></li>
</ol>
</section>
    </>
  );
}
