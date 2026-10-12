import Link from "next/link";

export const metadata = { title: "My story · Backyard Cocina" };

export default function Story() {
  return (
    <section className="mystory">
      <img className="ms-side" src="/story-side.jpg" alt="Brant Fedor hugging his dog" />
      <div className="ms-text">
        <p className="ms-eyebrow">MY STORY</p>
        <h1>I&rsquo;m Brant Fedor, from LA.</h1>
        <p>The flavors, the people, the traditions and the way food brings everyone together have always been part of who I am.</p>
        <p>I started making salsas in my backyard for friends and family, and they kept telling me the same thing: <b>my flavor is unique.</b></p>
        <p>Now I&rsquo;m sharing that flavor with more people — authentic Mexican salsas, made with traditional ingredients, fresh produce and my own touch.</p>
        <Link className="ms-btn" href="/shop">ORDER NOW <span aria-hidden="true">→</span></Link>
      </div>
      <img className="ms-table" src="/story-table.jpg" alt="" />
    </section>
  );
}
