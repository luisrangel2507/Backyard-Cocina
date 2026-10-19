// English / Spanish strings. Use t("key") in client components (useT) or server pages (getT).
export type Lang = "en" | "es";

const en = {
  // nav / shared
  ourStory: "OUR STORY", merch: "MERCH", club: "BACKYARD CLUB", kitchenLogin: "KITCHEN LOGIN",
  menuOrder: "Order salsas", menuStory: "Our story", menuMerch: "Merch · soon", menuCart: "View cart", menuClub: "Backyard Club", menuKitchen: "Kitchen login 🔒",
  openCart: "Open cart", backToShop: "← Back to the shop",
  // hero
  heroL1: "BOLD", heroL2: "MEXICAN", heroL3: "SALSAS", heroScript: "for Backyard Moments",
  heroLead: "Authentic Mexican flavors. Made for BBQs, tailgates and everyday adventures.",
  badgeNatural: "NATURAL\nINGREDIENTS", badgeAuthentic: "AUTHENTIC\nRECIPES", badgeBbq: "PERFECT FOR\nBBQs & TAILGATES",
  ourSalsas: "OUR SALSAS", slogan: "Small batches.\nBig flavor.",
  catAll: "All", catPacks: "Packs",
  // product cards
  pack: "Pack", salsa: "Salsa", jars: "jars", save: "SAVE", add: "ADD TO CART", soldOut: "SOLD OUT", added: "✓ ADDED",
  heat1: "Mild", heat3: "Medium", heat4: "Hot", heat5: "Extra hot",
  perUnit: "12 oz",
  // sections
  howTitle: "How it works",
  how1: "Order online", how1d: "Pick your salsas, a day and a time.",
  how2: "Made fresh", how2d: "Brant makes your batch by hand in small runs.",
  how3: "Pick up or delivery", how3d: "Free pickup in Torrance or local delivery.",
  faqTitle: "FAQ",
  q1: "How long does the salsa last?", a1: "Keep it in the fridge. It's best within 7–10 days of opening, and up to 2 weeks sealed.",
  q2: "Does it need refrigeration?", a2: "Yes. It's fresh salsa with no preservatives, so keep it cold and close the lid after each use.",
  q3: "Where do you deliver?", a3: "We deliver to nearby ZIP codes around Torrance. Enter your ZIP in the cart to see if we reach you and the fee.",
  q4: "Where is pickup?", a4: "1636 Greenwood Ave, Torrance, CA. Choose your day and time window at checkout.",
  q5: "How spicy is it?", a5: "Each salsa shows its heat with chiles 🌶 from 1 (mild) to 5 (extra hot).",
  q6: "Can I change or cancel my order?", a6: "Text us as soon as possible. If we haven't started your batch, we'll fix it or refund you.",
  clubTitle: "Backyard Club", clubText: "1 stamp for every jar. 10 jars = 1 free salsa. 20 jars = free merch. Plus a free salsa in your birthday month.", clubJoin: "Join free →", clubIn: "My card →",
  dropTag: "Limited drop · Coming soon", dropTitle: "Seasonal salsa", dropText: "A small-batch flavor that changes with the season. Backyard Club members hear about it first.",
  merchTitle: "MERCH", merchSoon: "Under construction", merchText: "Shirts, hats and more are on the way.",
  footTitle: "From our backyard to your table", footMade: "Made in Torrance, CA · Pickup & local delivery",
  viewCart: "View cart →", item: "item", items: "items",
  // cart
  cartTitle: "Your cart", cartEmpty: "Nothing here yet.", browse: "Browse salsas", clearCart: "Empty cart", subtotal: "Subtotal", each: "each",
  howWant: "How do you want it?", pickupFree: "Pickup · Free", deliveryZone: "Delivery · by zone",
  zip: "ZIP code", street: "Street address", pickupAt: "Pickup at", soldOutShort: " · sold out", onlyLeft: " · only {n} jars left",
  deliveryTo: "Delivery to {zone}: {fee}", noDelivery: "We don't deliver to that ZIP yet. Choose pickup instead.",
  useFree: "🎁 Use my free salsa ({n} available)", loginToEarn: "Create a free account", loginToEarn2: " to earn stamps and get free salsas.",
  checkout: "Checkout", opening: "Opening secure checkout…", checkoutFail: "Checkout failed. Try again.",
  // success
  okConfirmed: "Order confirmed", okReady: "Your order is ready! 🌶", okPacked: "Your order is packed 🌶", okCancelled: "Order cancelled",
  stReceived: "Order received", stReadyPickup: "Ready for pickup", stPickedUp: "Picked up", stPacked: "Packed", stOnWay: "On the way", stDelivered: "Delivered",
  okThanks: "Thanks{name}! We charged {total} and a receipt is on its way to {email}.",
  okPickup: "Pickup", okDelivery: "Delivery", okBookmark: "Save or bookmark this page to check your order status. It updates on its own.",
  okInvoice: "Download invoice (PDF)", okBack: "Back to the shop", okNoPay: "We couldn't confirm that payment. If you were charged, email us and we'll sort it out.",
  // account
  accTitle: "Backyard Club", accIntro: "Create a free account to collect a stamp for every jar. 10 jars = 1 free salsa.",
  tabSignup: "Create account", tabLogin: "Log in",
  fName: "Your name", fEmail: "Email", fPassword: "Password (8+ characters)", fPhone: "Phone (optional)", fBirth: "Birthday month (optional, free salsa!)", fRef: "Referral code (optional)", fOffers: "Send me offers and new drops",
  btnSignup: "Create my account", btnLogin: "Log in", wait: "One moment…",
  errFields: "Fill in your name, email and a password of 8+ characters", errExists: "That email already has an account. Log in instead.", errBad: "Wrong email or password", errMany: "Too many attempts. Try again in 15 minutes.",
  forgot: "Forgot your password? Text us and we'll reset it.",
  // profile
  hi: "Hi, {name}", stampCard: "Stamp card", jarsTotal: "{n} jars total · {more} more for your next free salsa",
  freeAvail: "🎁 Free salsas available:", applyCheckout: " — use it in your cart.", merchAvail: "👕 Free merch rewards available:", every: "every {n} jars",
  refCode: "Your referral code:", save2: "Save", logout: "Log out", birthPh: "Birthday month (free salsa!)", orderNow: "Order salsas",
  months: "January,February,March,April,May,June,July,August,September,October,November,December",
  // story
  stEyebrow: "MY STORY", stTitle: "I’m Brant Fedor, from LA.",
  st1: "The flavors, the people, the traditions and the way food brings everyone together have always been part of who I am.",
  st2a: "I started making salsas in my backyard for friends and family, and they kept telling me the same thing: ", st2b: "my flavor is unique.",
  st3: "Now I’m sharing that flavor with more people — authentic Mexican salsas, made with traditional ingredients, fresh produce and my own touch.",
  stOrder: "ORDER NOW",
  // detail + merch
  allSalsas: "← All salsas", pairsWith: "Pairs with", tipTitle: "Brant's tip", reviews: "Reviews", noReviews: "No reviews yet. Tried it? Log in after your order to leave one.", orderFor: "Order",
  merchP: "Backyard Cocina shirts, hats and more are on the way. Check back soon.", tees: "Tees", hats: "Hats", totes: "Totes",
} as const;

export type Key = keyof typeof en;

const es: Record<Key, string> = {
  ourStory: "NUESTRA HISTORIA", merch: "MERCH", club: "BACKYARD CLUB", kitchenLogin: "ACCESO COCINA",
  menuOrder: "Pedir salsas", menuStory: "Nuestra historia", menuMerch: "Merch · pronto", menuCart: "Ver carrito", menuClub: "Backyard Club", menuKitchen: "Acceso cocina 🔒",
  openCart: "Abrir carrito", backToShop: "← Volver a la tienda",
  heroL1: "SALSAS", heroL2: "MEXICANAS", heroL3: "AUDACES", heroScript: "para momentos de patio",
  heroLead: "Sabores auténticos mexicanos. Hechas para asados, partidos y aventuras de todos los días.",
  badgeNatural: "INGREDIENTES\nNATURALES", badgeAuthentic: "RECETAS\nAUTÉNTICAS", badgeBbq: "PERFECTAS PARA\nASADOS Y PARTIDOS",
  ourSalsas: "NUESTRAS SALSAS", slogan: "Lotes pequeños.\nMucho sabor.",
  catAll: "Todas", catPacks: "Paquetes",
  pack: "Paquete", salsa: "Salsa", jars: "frascos", save: "AHORRA", add: "AGREGAR", soldOut: "AGOTADA", added: "✓ AGREGADA",
  heat1: "Suave", heat3: "Medio", heat4: "Picante", heat5: "Muy picante",
  perUnit: "12 oz",
  howTitle: "Cómo funciona",
  how1: "Pide en línea", how1d: "Elige tus salsas, un día y una hora.",
  how2: "Hecha al momento", how2d: "Brant prepara tu lote a mano, en tandas pequeñas.",
  how3: "Recoge o a domicilio", how3d: "Recoge gratis en Torrance o entrega local.",
  faqTitle: "PREGUNTAS FRECUENTES",
  q1: "¿Cuánto dura la salsa?", a1: "Guárdala en el refrigerador. Es mejor consumirla en 7–10 días después de abrirla, y hasta 2 semanas cerrada.",
  q2: "¿Necesita refrigeración?", a2: "Sí. Es salsa fresca sin conservadores, así que mantenla fría y cierra la tapa después de cada uso.",
  q3: "¿Dónde entregan?", a3: "Entregamos en códigos postales cercanos a Torrance. Escribe tu código postal en el carrito para ver si llegamos y el costo.",
  q4: "¿Dónde recojo mi pedido?", a4: "1636 Greenwood Ave, Torrance, CA. Elige tu día y horario al pagar.",
  q5: "¿Qué tan picante es?", a5: "Cada salsa muestra su picor con chiles 🌶 de 1 (suave) a 5 (muy picante).",
  q6: "¿Puedo cambiar o cancelar mi pedido?", a6: "Escríbenos lo antes posible. Si aún no empezamos tu lote, lo arreglamos o te reembolsamos.",
  clubTitle: "Backyard Club", clubText: "1 sello por cada frasco. 10 frascos = 1 salsa gratis. 20 frascos = merch gratis. Y una salsa gratis en el mes de tu cumpleaños.", clubJoin: "Únete gratis →", clubIn: "Mi tarjeta →",
  dropTag: "Edición limitada · Pronto", dropTitle: "Salsa de temporada", dropText: "Un sabor en lote pequeño que cambia con la temporada. Los miembros del Backyard Club se enteran primero.",
  merchTitle: "MERCH", merchSoon: "En construcción", merchText: "Camisas, gorras y más en camino.",
  footTitle: "De nuestro patio a tu mesa", footMade: "Hecho en Torrance, CA · Recoge o entrega local",
  viewCart: "Ver carrito →", item: "artículo", items: "artículos",
  cartTitle: "Tu carrito", cartEmpty: "Aún no hay nada.", browse: "Ver salsas", clearCart: "Vaciar carrito", subtotal: "Subtotal", each: "c/u",
  howWant: "¿Cómo lo quieres?", pickupFree: "Recoger · Gratis", deliveryZone: "Entrega · por zona",
  zip: "Código postal", street: "Dirección", pickupAt: "Recoger en", soldOutShort: " · agotado", onlyLeft: " · solo quedan {n} frascos",
  deliveryTo: "Entrega a {zone}: {fee}", noDelivery: "Todavía no entregamos en ese código postal. Elige recoger.",
  useFree: "🎁 Usar mi salsa gratis ({n} disponible)", loginToEarn: "Crea una cuenta gratis", loginToEarn2: " para ganar sellos y salsas gratis.",
  checkout: "Pagar", opening: "Abriendo pago seguro…", checkoutFail: "No se pudo pagar. Inténtalo de nuevo.",
  okConfirmed: "Pedido confirmado", okReady: "¡Tu pedido está listo! 🌶", okPacked: "Tu pedido está empacado 🌶", okCancelled: "Pedido cancelado",
  stReceived: "Pedido recibido", stReadyPickup: "Listo para recoger", stPickedUp: "Recogido", stPacked: "Empacado", stOnWay: "En camino", stDelivered: "Entregado",
  okThanks: "¡Gracias{name}! Cobramos {total} y el recibo va en camino a {email}.",
  okPickup: "Recoger", okDelivery: "Entrega", okBookmark: "Guarda esta página para ver el estado de tu pedido. Se actualiza sola.",
  okInvoice: "Descargar factura (PDF)", okBack: "Volver a la tienda", okNoPay: "No pudimos confirmar ese pago. Si te cobraron, escríbenos y lo resolvemos.",
  accTitle: "Backyard Club", accIntro: "Crea una cuenta gratis para juntar un sello por cada frasco. 10 frascos = 1 salsa gratis.",
  tabSignup: "Crear cuenta", tabLogin: "Iniciar sesión",
  fName: "Tu nombre", fEmail: "Correo", fPassword: "Contraseña (8+ caracteres)", fPhone: "Teléfono (opcional)", fBirth: "Mes de cumpleaños (opcional, ¡salsa gratis!)", fRef: "Código de referido (opcional)", fOffers: "Quiero recibir ofertas y novedades",
  btnSignup: "Crear mi cuenta", btnLogin: "Iniciar sesión", wait: "Un momento…",
  errFields: "Escribe tu nombre, correo y una contraseña de 8+ caracteres", errExists: "Ese correo ya tiene cuenta. Inicia sesión.", errBad: "Correo o contraseña incorrectos", errMany: "Demasiados intentos. Prueba en 15 minutos.",
  forgot: "¿Olvidaste tu contraseña? Escríbenos y la restablecemos.",
  hi: "Hola, {name}", stampCard: "Tarjeta de sellos", jarsTotal: "{n} frascos en total · {more} más para tu próxima salsa gratis",
  freeAvail: "🎁 Salsas gratis disponibles:", applyCheckout: " — úsala en tu carrito.", merchAvail: "👕 Premios de merch disponibles:", every: "cada {n} frascos",
  refCode: "Tu código de referido:", save2: "Guardar", logout: "Cerrar sesión", birthPh: "Mes de cumpleaños (¡salsa gratis!)", orderNow: "Pedir salsas",
  months: "enero,febrero,marzo,abril,mayo,junio,julio,agosto,septiembre,octubre,noviembre,diciembre",
  stEyebrow: "MI HISTORIA", stTitle: "Soy Brant Fedor, de LA.",
  st1: "Los sabores, la gente, las tradiciones y la manera en que la comida une a todos siempre han sido parte de quien soy.",
  st2a: "Empecé a hacer salsas en mi patio para amigos y familia, y siempre me decían lo mismo: ", st2b: "mi sabor es único.",
  st3: "Ahora comparto ese sabor con más personas: salsas mexicanas auténticas, hechas con ingredientes tradicionales, productos frescos y mi toque personal.",
  stOrder: "PEDIR AHORA",
  allSalsas: "← Todas las salsas", pairsWith: "Combina con", tipTitle: "Consejo de Brant", reviews: "Reseñas", noReviews: "Aún no hay reseñas. ¿Ya la probaste? Inicia sesión después de tu pedido para dejar una.", orderFor: "Pedir",
  merchP: "Camisas, gorras y más de Backyard Cocina en camino. Vuelve pronto.", tees: "Playeras", hats: "Gorras", totes: "Bolsas",
};

export const dict = { en, es } as const;

export function translate(lang: Lang, key: Key, vars?: Record<string, string | number>) {
  let s: string = dict[lang][key] ?? dict.en[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

// Spanish text for the seeded products. Only used when the stored English text is still the original.
const SEED: Record<string, { description: string; descriptionEs: string; pairs: string[]; pairsEs: string[]; tip: string; tipEs: string }> = {
  verde: {
    description: "Tomatillo, serrano, cilantro and lime. Bright, fresh and made for tacos.",
    descriptionEs: "Tomatillo, serrano, cilantro y limón. Brillante, fresca y hecha para tacos.",
    pairs: ["Tacos", "Eggs", "Chips"], pairsEs: ["Tacos", "Huevos", "Totopos"],
    tip: "Spoon it over carnitas tacos with diced onion and a squeeze of lime.",
    tipEs: "Échala sobre tacos de carnitas con cebolla picada y unas gotas de limón.",
  },
  roja: {
    description: "Roasted tomatoes, guajillo and árbol chiles. Bold, smoky and full of flavor.",
    descriptionEs: "Jitomates asados, chiles guajillo y de árbol. Intensa, ahumada y llena de sabor.",
    pairs: ["Carne asada", "Chilaquiles", "Burritos"], pairsEs: ["Carne asada", "Chilaquiles", "Burritos"],
    tip: "Simmer a cup with tortilla chips for 2 minutes for quick chilaquiles rojos.",
    tipEs: "Hierve una taza con totopos por 2 minutos para unos chilaquiles rojos rápidos.",
  },
  creamy: {
    description: "Roasted peppers, garlic and a creamy twist. Smooth with a kick.",
    descriptionEs: "Chiles asados, ajo y un toque cremoso. Suave con un poco de picor.",
    pairs: ["Chicken", "Fries", "Bowls"], pairsEs: ["Pollo", "Papas fritas", "Bowls"],
    tip: "Use it as a dip for fries or drizzle it on a grilled chicken bowl.",
    tipEs: "Úsala para mojar papas fritas o échala sobre un bowl de pollo a la parrilla.",
  },
  trio: {
    description: "One Verde, one Roja and one Creamy. Save $3.98 and earn 3 stamps.",
    descriptionEs: "Una Verde, una Roja y una Creamy. Ahorra $3.98 y gana 3 sellos.",
    pairs: ["Taco night", "Parties", "Gifts"], pairsEs: ["Noche de tacos", "Fiestas", "Regalos"],
    tip: "Set out all three for taco night and let everyone build their own.",
    tipEs: "Pon las tres en la mesa para la noche de tacos y que cada quien arme la suya.",
  },
};

/** Localized description / pairs / tip for a product (falls back to what is stored). */
export function localizeProduct<T extends { id: string; description: string; pairs: string[]; tip: string }>(lang: Lang, p: T) {
  const s = SEED[p.id];
  if (lang !== "es" || !s) return { description: p.description, pairs: p.pairs, tip: p.tip };
  return {
    description: p.description === s.description ? s.descriptionEs : p.description,
    pairs: p.pairs.join("|") === s.pairs.join("|") ? s.pairsEs : p.pairs,
    tip: p.tip === s.tip ? s.tipEs : p.tip,
  };
}
