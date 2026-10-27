"use client";
import { useState } from "react";
import { saveProduct, removeProduct } from "./actions";

type P = { id: string; name: string; category: string; price: string; heat: number; jars: number; description: string; pairs: string; tip: string; color: string; soldOut: boolean; image: string };

// Resize a photo in the browser to max 800px WebP so it can be stored with the product.
async function shrink(file: File): Promise<string> {
  const img = await createImageBitmap(file);
  const k = Math.min(1, 800 / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/webp", 0.82);
}

export default function ProductForm({ cats, product }: { cats: string[]; product?: P }) {
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState(product?.image ?? "");
  const [newCat, setNewCat] = useState(false);
  return (
    <form action={saveProduct} className="pform">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="image" value={image} />
      <label className="pphoto">
        {preview ? <img src={preview} alt="" /> : <span>📷 Add photo</span>}
        <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const d = await shrink(f); setImage(d); setPreview(d); }} />
      </label>
      <label>Name<input name="name" required maxLength={60} defaultValue={product?.name} placeholder="Salsa Macha" /></label>
      <label>Type
        {newCat
          ? <input name="newCategory" required maxLength={30} placeholder="e.g. Macha, Habanero" />
          : <select name="category" defaultValue={product?.category ?? "Verde"} onChange={(e) => e.target.value === "__new" && setNewCat(true)}>
              {cats.map((c) => <option key={c}>{c}</option>)}
              <option value="__new">+ New type…</option>
            </select>}
      </label>
      <div className="prow2">
        <label>Price $<input name="price" type="number" step="0.01" min="0.5" required defaultValue={product?.price ?? "8.99"} /></label>
        <label>Heat 1–5<input name="heat" type="number" min={1} max={5} defaultValue={product?.heat ?? 2} /></label>
        <label>Jars<input name="jars" type="number" min={1} max={12} defaultValue={product?.jars ?? 1} /></label>
      </div>
      <label>Description<textarea name="description" rows={2} maxLength={400} defaultValue={product?.description} placeholder="What it tastes like" /></label>
      <label>Pairs with (comma separated)<input name="pairs" defaultValue={product?.pairs} placeholder="Tacos, Eggs, Chips" /></label>
      <label>Brant's tip<input name="tip" defaultValue={product?.tip} maxLength={300} /></label>
      <div className="prow2">
        <label>Color<input name="color" type="color" defaultValue={product?.color ?? "#139a74"} /></label>
        <label className="chk"><input type="checkbox" name="soldOut" defaultChecked={product?.soldOut} /> Sold out</label>
      </div>
      <button className="btn">{product ? "Save changes" : "Add salsa"}</button>
      {product && <button type="button" className="linkbtn" onClick={async () => { if (confirm(`Remove ${product.name} from the shop?`)) await removeProduct(product.id); }}>Remove from shop</button>}
    </form>
  );
}
