"use client";
import { useEffect, useState } from "react";
// import InteriorMotion from "@/components/interior-motion";
import ShowroomHome from "@/components/showroom-home";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  MapPin,
  ArrowRight,
  Menu,
  X,
  Truck,
  ShieldCheck,
  Headphones,
  Tag,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  Armchair,
  Tv,
  Refrigerator,
  WashingMachine,
  Wind,
  UtensilsCrossed,
  Smartphone,
  BedDouble,
  DoorOpen,
  Monitor,
  Check,
  MessageCircle,
  ArrowUpRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Toaster, toast } from "sonner";
import { seed, categories, money, Product } from "@/lib/catalog";
const icons = [
  Tv,
  Refrigerator,
  WashingMachine,
  Wind,
  UtensilsCrossed,
  Smartphone,
  Armchair,
  BedDouble,
  UtensilsCrossed,
  DoorOpen,
  Monitor,
  Armchair,
];
const address = "Sheshashayi Complex, Seebinakere, Sagara Road, Thirthahalli, Karnataka";
const maps =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("Liyas Electronics Furniture " + address);
export default function Shop({ path }: { path: string[] }) {
  const route = path[0] || "home";
  const [products, setProducts] = useState<Product[]>(seed),
    [user, setUser] = useState<any>(null),
    [cart, setCart] = useState<{ id: string; qty: number }[]>([]),
    [wish, setWish] = useState<string[]>([]),
    [orders, setOrders] = useState<any[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("All"),
    [brand, setBrand] = useState("All"),
    [sort, setSort] = useState("popular"),
    [max, setMax] = useState(""),
    [stock, setStock] = useState(false),
    [mobile, setMobile] = useState(false),
    [tab, setTab] = useState("All"),
    [qty, setQty] = useState(1),
    [busy, setBusy] = useState(false),
    [success, setSuccess] = useState(""),
    [admin, setAdmin] = useState<any>(null),
    [edit, setEdit] = useState<any>(null);
  useEffect(() => {
    const header = document.querySelector("header");
    const topbar = document.querySelector(".topbar");
    const measure = () => {
      const h =
        (header?.getBoundingClientRect().height || 0) +
        (topbar?.getBoundingClientRect().height || 0);
      document.documentElement.style.setProperty("--site-header-height", h + "px");
    };
    const observer = new ResizeObserver(measure);
    if (header) observer.observe(header);
    if (topbar) observer.observe(topbar);
    measure();
    const desktop = window.matchMedia("(min-width: 1024px)");
    const close = () => {
      if (desktop.matches) setMobile(false);
    };
    desktop.addEventListener("change", close);
    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", close);
      document.documentElement.style.removeProperty("--site-header-height");
    };
  }, []);
  async function load() {
    try {
      const r = await fetch("/api/shop");
      const d: any = await r.json();
      if (!r.ok) throw Error(d.error);
      setProducts(d.products);
      setUser(d.user);
      setOrders(d.orders);
      if (d.state) {
        setCart(d.state.cart || []);
        setWish(d.state.wishlist || []);
        try {
          const guest = JSON.parse(localStorage.getItem("liyas-guest-cart") || "[]");
          if (guest.length) {
            const merged = [...(d.state.cart || [])];
            for (const i of guest) {
              const old = merged.find((x: any) => x.id === i.id);
              if (old) old.qty = Math.min(20, old.qty + i.qty);
              else merged.push(i);
            }
            await api("state", { cart: merged, wishlist: d.state.wishlist || [] });
            setCart(merged);
            localStorage.removeItem("liyas-guest-cart");
          }
        } catch {}
      } else {
        try {
          setCart(JSON.parse(localStorage.getItem("liyas-guest-cart") || "[]"));
        } catch {}
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    const q = new URLSearchParams(location.search);
    setQuery(q.get("q") || "");
    setCategory(q.get("category") || "All");
    if (route === "admin")
      fetch("/api/shop?type=admin")
        .then((r) => r.json())
        .then(setAdmin);
  }, []);
  async function api(action: string, data: any, extra: any = {}) {
    const r = await fetch("/api/shop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, data, ...extra }),
    });
    const d: any = await r.json();
    if (!r.ok) throw Error(d.error);
    return d;
  }
  async function persist(c: typeof cart, w: string[]) {
    try {
      if (user) await api("state", { cart: c, wishlist: w });
      else localStorage.setItem("liyas-guest-cart", JSON.stringify(c));
      setCart(c);
      setWish(w);
    } catch (e: any) {
      toast.error(e.message);
    }
  }
  function add(p: Product) {
    const old = cart.find((i) => i.id === p.id);
    if ((old?.qty || 0) >= Math.min(20, p.stock)) {
      toast.error("Maximum available quantity reached");
      return;
    }
    persist(
      old
        ? cart.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...cart, { id: p.id, qty: 1 }],
      wish,
    );
    toast.success("Added to your cart");
  }
  function wishlist(p: Product) {
    if (!user) {
      location.href = "/login";
      return;
    }
    persist(cart, wish.includes(p.id) ? wish.filter((i) => i !== p.id) : [...wish, p.id]);
  }
  const count = cart.reduce((s, i) => s + i.qty, 0),
    total = cart.reduce((s, i) => s + (products.find((p) => p.id === i.id)?.price || 0) * i.qty, 0);
  const filtered = products
    .filter(
      (p) =>
        (!["electronics", "furniture"].includes(route) || p.group.toLowerCase() === route) &&
        (route !== "offers" || p.original > p.price) &&
        (route !== "wishlist" || wish.includes(p.id)) &&
        (category === "All" || p.category === category) &&
        (brand === "All" || p.brand === brand) &&
        (max === "" || p.price <= Number(max)) &&
        (!stock || p.stock > 0) &&
        (p.name + " " + p.brand + " " + p.category).toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : sort === "discount"
            ? 1 - b.price / b.original - (1 - a.price / a.original)
            : 0,
    );
  function card(p: Product) {
    return (
      <article className="product" key={p.id}>
        <div className="product-image">
          <a href={"/products/" + p.id}>
            <img src={p.image} alt={p.name} loading="lazy" />
          </a>
          <span className="discount">{Math.round((1 - p.price / p.original) * 100)}% OFF</span>
          <button
            className={"heart " + (wish.includes(p.id) ? "selected" : "")}
            aria-label={"Save " + p.name}
            onClick={() => wishlist(p)}
          >
            <Heart size={18} />
          </button>
        </div>
        <div className="product-info">
          {/* <span className="eyebrow">{p.brand}</span> */}
          <a href={"/products/" + p.id}>
            <h3>{p.name}</h3>
          </a>
          <div className="availability">
            {/* {p.stock > 0 ? "Available in sample catalogue" : "Out of stock"} */}
          </div>
          <div className="price">
            {/* <strong>{money(p.price)}</strong> */}
            {/* <del>{money(p.original)}</del> */}
          
          </div>
        </div>
      </article>
    );
  }
  function field(name: string, label: string, type = "text", required = true, value?: string) {
    return (
      <label className="field">
        {label}
        <input name={name} type={type} required={required} defaultValue={value} />
      </label>
    );
  }
  return (
    <>
      {/* <InteriorMotion enabled={route === "home" || route === "about"} /> */}
      <Toaster position="bottom-center" />
      <div className="topbar">
        <span>
          <MapPin size={13} /> Your neighbourhood showroom in Thirthahalli
        </span>
        <span>
          Good homes start with great choices <span className="top-divider">|</span>{" "}
          <a href="/contact">
            Visit our store <ArrowRight size={12} />
          </a>
        </span>
      </div>
      <header>
        <div className="main-header">
          <a
            className="logo brand-logo"
            href="/"
            aria-label="Liya’s Furniture & Electronics — Home"
          >
            <span className="logo-crop">
              <img src="/images/liyas-logo.png" alt="Liya’s Furniture & Electronics" />
            </span>
          </a>
        <form className="search" action="/products">
            <Search size={18} />
            <input
              name="q"
              placeholder="Search for a sofa, TV, refrigerator..."
              aria-label="Search products"
            />
            <button type="submit">Search</button>
          </form>
          <div className="header-actions">
              
            <a href="/account" aria-label="My account">
              <User />
              <span>Account</span>
            </a>
            <a href="/wishlist" aria-label="Wishlist">
              <Heart />
              <span>Wishlist</span>
            </a>
            <a className="cart-icon" href="/cart" aria-label={"Cart with " + count + " items"}>
              <ShoppingBag />
              <i>{count}</i>
              <span>Cart</span>
            </a>
            <Sheet open={mobile} onOpenChange={setMobile}>
              <SheetTrigger asChild>
                <button className="mobile-toggle" aria-label="Open navigation menu">
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="mobile-menu-sheet" showCloseButton={false}>
                <SheetHeader className="mobile-menu-heading">
                  <SheetTitle className="sr-only">Liya’s navigation</SheetTitle>
                  <SheetDescription className="sr-only">
                    Explore furniture, electronics and your account.
                  </SheetDescription>
                  <a
                    className="brand-logo"
                    href="/"
                    onClick={() => setMobile(false)}
                    aria-label="Liya’s home"
                  >
                    <span className="logo-crop">
                      <img src="/images/liyas-logo.png" alt="Liya’s Furniture & Electronics" />
                    </span>
                  </a>
                  <SheetClose asChild>
                    <button className="drawer-close" aria-label="Close navigation menu">
                      <X size={23} />
                    </button>
                  </SheetClose>
                </SheetHeader>
                <div className="mobile-menu-scroll">
                  <form
                    className="drawer-search"
                    action="/products"
                    onSubmit={() => setMobile(false)}
                  >
                    <Search size={19} />
                    <input
                      name="q"
                      placeholder="Find something for your home"
                      aria-label="Search products"
                    />
                    <button type="submit" aria-label="Submit product search">
                      <ArrowRight size={20} />
                    </button>
                  </form>
                  <div className="drawer-nav" role="navigation" aria-label="Mobile navigation">
                    {[
                      ["/", "Home"],
                      ["/furniture", "Furniture"],
                      ["/electronics", "Electronics"],
                      ["/products", "All Products"],
                      ["/offers", "Offers"],
                      ["/about", "About Us"],
                      ["/contact", "Contact Us"],
                    ].map(([url, label]) => (
                      <a
                        key={url}
                        href={url}
                        onClick={() => setMobile(false)}
                        aria-current={
                          (route === "home" ? url === "/" : url === "/" + route)
                            ? "page"
                            : undefined
                        }
                      >
                        <span>{label}</span>
                        <ChevronRight size={18} />
                      </a>
                    ))}
                  </div>
                  <div className="drawer-account">
                    <a href="/account" onClick={() => setMobile(false)}>
                      <User size={20} />
                      <span>My account</span>
                    </a>
                    <a href="/wishlist" onClick={() => setMobile(false)}>
                      <Heart size={20} />
                      <span>Wishlist</span>
                      <small>{wish.length}</small>
                    </a>
                    <a href="/cart" onClick={() => setMobile(false)}>
                      <ShoppingBag size={20} />
                      <span>Shopping cart</span>
                      <small>{count}</small>
                    </a>
                  </div>
                  <div className="drawer-visit">
                    <MapPin size={20} />
                    <div>
                      <b>Visit our showroom</b>
                      <p>
                        Seebinakere, Sagara Road
                        <br />
                        Thirthahalli, Karnataka
                      </p>
                      <a href="/contact" onClick={() => setMobile(false)}>
                        Plan your visit <ArrowRight size={15} />
                      </a>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        <nav className="desktop-nav" aria-label="Main navigation">
          <div>
            {[
              ["/", "Home"],
              ["/products", "All Products"],
              ["/products?category=Sofas", "Living room"],
              ["/products?category=Dining%20Tables", "Dining room"],
              ["/products?category=Beds", "Bedroom"],
              ["/electronics", "Electronics"],
              ["/furniture", "Furniture"],
              ["/offers", "Offers"],
            ].map(([url, label]) => (
              <a
                className={(route === "home" ? url === "/" : url === "/" + route) ? "active" : ""}
                key={url}
                href={url}
              >
                {label}
                {label === "Offers" && <span className="nav-tag">SALE</span>}
              </a>
            ))}
          </div>
     
        </nav>
      </header>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="header-spacer" />
          {error && (
            <div className="notice">
              {error} <button onClick={() => location.reload()}>Retry</button>
            </div>
          )}
          {route === "home" ? (
            <ShowroomHome products={products} renderProduct={card} />
          ) : ["products", "electronics", "furniture", "offers", "wishlist"].includes(route) &&
            path.length < 2 ? (
            <main>
              <div className="breadcrumb">
                <a href="/">Home</a>
                <ChevronRight size={14} />
                {route}
              </div>
              <div className="collection-heading">
                <span className="eyebrow">THE LIYAS COLLECTION</span>
                <h1>
                  {route === "products"
                    ? "All products"
                    : route === "wishlist"
                      ? "Your saved favourites."
                      : route === "offers"
                        ? "More home. More value."
                        : route === "furniture"
                          ? "Comfort, in every corner."
                          : "Smarter living starts here."}
                </h1>
                <p>
                  {route === "products"
                    ? "Explore all furniture and electronics in one place. Sample prices and availability require showroom confirmation."
                    : route === "wishlist"
                      ? "The pieces you love, all in one place."
                      : "Browse our sample collection. Confirm final prices and specifications with the store."}
                </p>
              </div>
              <div className="catalog">
                <aside>
                  <h3>Refine your search</h3>
                  <label className="field">
                    Search
                    <input
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                      }}
                      placeholder="Search products"
                    />
                  </label>
                  <label className="field">
                    Category
                    <Select
                      value={category}
                      onValueChange={(v) => {
                        setCategory(v);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "All",
                          ...new Set([...categories, ...products.map((p) => p.category)]),
                        ].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="field">
                    Brand
                    <Select value={brand} onValueChange={setBrand}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["All", ...new Set(products.map((p) => p.brand))].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="field">
                    Maximum price
                    <input
                      type="number"
                      min="0"
                      placeholder="No limit"
                      value={max}
                      onChange={(e) => setMax(e.target.value)}
                    />
                  </label>
                  <label className="check">
                    <Checkbox checked={stock} onCheckedChange={(v) => setStock(!!v)} /> In stock
                    only
                  </label>
                  <button
                    className="text-button"
                    onClick={() => {
                      setCategory("All");
                      setBrand("All");
                      setQuery("");
                      setMax("");
                      setStock(false);
                    }}
                  >
                    Clear filters
                  </button>
                </aside>
                <div>
                  <div className="catalog-top">
                    <span>{filtered.length} products</span>
                    <Select value={sort} onValueChange={setSort}>
                      <SelectTrigger className="sort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          ["popular", "Featured"],
                          ["low", "Price: low to high"],
                          ["high", "Price: high to low"],
                          ["discount", "Highest discount"],
                        ].map(([v, l]) => (
                          <SelectItem value={v} key={v}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="product-grid three grid grid-cols-3 gap-6 max-[1101px]:grid-cols-2 max-[1024px]:gap-5 max-[761px]:gap-[14px]">
                    {filtered.map(card)}
                  </div>
                  {!filtered.length && (
                    <div className="empty">
                      <Heart />
                      <h3>
                        {route === "wishlist" ? "Your wishlist is waiting" : "No products found"}
                      </h3>
                      <p>
                        {route === "wishlist"
                          ? "Save the products you love using the heart button."
                          : "Try another category or clear your filters."}
                      </p>
                      <a href="/products" className="btn">
                        Explore products
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </main>
          ) : route === "products" && path[1] ? (
            (() => {
              const p = products.find((p) => p.id === path[1]);
              return p ? (
                <main>
                  <div className="breadcrumb">
                    <a href="/products">All products</a>
                    <ChevronRight size={14} />
                    {p.name}
                  </div>
                  <div className="detail">
                    <div className="detail-image">
                      <img src={p.image} alt={p.name} />
                    </div>
                    <div>
                      <span className="eyebrow">
                        {p.brand} · {p.category}
                      </span>
                      <h1>{p.name}</h1>
                      <p>{p.description}</p>
                      <div className="detail-price">
                        {money(p.price)} <del>{money(p.original)}</del>
                      </div>
                      <p>
                        {p.stock} available in sample catalogue · SKU: {p.id.toUpperCase()}
                      </p>
                      <div className="quantity">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() => setQty(Math.max(1, qty - 1))}
                        >
                          <Minus size={16} />
                        </button>
                        <span>{qty}</span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() => setQty(Math.min(p.stock, 20, qty + 1))}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="detail-actions">
                        <button
                          className="btn"
                          onClick={() => {
                            persist(
                              [...cart.filter((i) => i.id !== p.id), { id: p.id, qty }],
                              wish,
                            );
                            toast.success("Added to cart");
                          }}
                        >
                          Add to cart <ShoppingBag size={17} />
                        </button>
                        <button className="btn outline" onClick={() => wishlist(p)}>
                          <Heart size={17} /> Save
                        </button>
                      </div>
                      <a
                        className="text-button"
                        href={"/contact?product=" + encodeURIComponent(p.name)}
                      >
                        Enquire about this product <ArrowRight size={16} />
                      </a>
                      <p className="sample-note">
                        Sample item. Orders are demonstration requests and do not reserve actual
                        stock.
                      </p>
                    </div>
                  </div>
                  <Tabs defaultValue="Description">
                    <TabsList>
                      {["Description", "Specifications", "Warranty", "Delivery", "Reviews"].map(
                        (t) => (
                          <TabsTrigger key={t} value={t}>
                            {t}
                          </TabsTrigger>
                        ),
                      )}
                    </TabsList>
                    {["Description", "Specifications", "Warranty", "Delivery", "Reviews"].map(
                      (t) => (
                        <TabsContent key={t} value={t} className="tab-copy">
                          {t === "Description"
                            ? p.description
                            : t === "Specifications"
                              ? "Brand: " +
                                p.brand +
                                ". Exact model, dimensions and specifications will be confirmed at the showroom."
                              : t === "Warranty"
                                ? "Warranty depends on the final product and manufacturer. Contact the showroom for written terms."
                                : t === "Delivery"
                                  ? "Store pickup and local delivery enquiries are available. Delivery areas, charges and timing require confirmation."
                                  : "No verified reviews yet."}
                        </TabsContent>
                      ),
                    )}
                  </Tabs>
                  <h2>You may also like</h2>
                  <div className="product-grid grid grid-cols-4 gap-6 max-[1024px]:gap-5 max-[761px]:grid-cols-2 max-[761px]:gap-[14px]">
                    {products
                      .filter((x) => x.id !== p.id && x.group === p.group)
                      .slice(0, 4)
                      .map(card)}
                  </div>
                </main>
              ) : (
                <main className="empty">
                  <h1>Product not found</h1>
                  <a href="/products">Browse the collection</a>
                </main>
              );
            })()
          ) : route === "cart" ? (
            <main>
              <div className="collection-heading">
                <span className="eyebrow">YOUR NEXT HOME UPGRADE</span>
                <h1>Your shopping cart</h1>
              </div>
              {cart.length ? (
                <div className="cart-layout">
                  <div>
                    {cart.map((i) => {
                      const p = products.find((p) => p.id === i.id);
                      return (
                        p && (
                          <div className="cart-row" key={i.id}>
                            <img src={p.image} alt={p.name} />
                            <div>
                              <a href={"/products/" + p.id}>
                                <h3>{p.name}</h3>
                              </a>
                              <p>{money(p.price)}</p>
                              <div className="quantity">
                                <button
                                  aria-label="Decrease"
                                  onClick={() =>
                                    persist(
                                      cart.map((x) =>
                                        x.id === i.id ? { ...x, qty: Math.max(1, x.qty - 1) } : x,
                                      ),
                                      wish,
                                    )
                                  }
                                >
                                  <Minus size={14} />
                                </button>
                                {i.qty}
                                <button aria-label="Increase" onClick={() => add(p)}>
                                  <Plus size={14} />
                                </button>
                              </div>
                            </div>
                            <strong>{money(p.price * i.qty)}</strong>
                            <button
                              aria-label="Remove item"
                              onClick={() =>
                                persist(
                                  cart.filter((x) => x.id !== i.id),
                                  wish,
                                )
                              }
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )
                      );
                    })}
                  </div>
                  <div className="summary">
                    <h2>Order summary</h2>
                    <p>
                      Subtotal <b>{money(total)}</b>
                    </p>
                    <p>
                      Delivery <span>Confirm with store</span>
                    </p>
                    <hr />
                    <p>
                      Total <b>{money(total)}</b>
                    </p>
                    <a className="btn" href="/checkout">
                      Proceed to checkout <ArrowRight size={16} />
                    </a>
                    <a href="/products">Continue shopping</a>
                    <small>Sample prices. Delivery charges are not included.</small>
                  </div>
                </div>
              ) : (
                <div className="empty">
                  <ShoppingBag />
                  <h2>A little room for something new.</h2>
                  <p>Your cart is currently empty.</p>
                  <a href="/products" className="btn">
                    Start exploring <ArrowRight size={16} />
                  </a>
                </div>
              )}
            </main>
          ) : route === "checkout" ? (
            <main className="narrow">
              <h1>Checkout</h1>
              {success ? (
                <div className="empty">
                  <Check />
                  <h2>Request saved</h2>
                  <p>
                    Your sample order reference is <b>{success}</b>. No payment has been collected
                    and no real stock is reserved.
                  </p>
                  <a className="btn" href="/account">
                    View my orders
                  </a>
                </div>
              ) : !user ? (
                <div className="empty">
                  <h2>Sign in to save your order</h2>
                  <a className="btn" href="/login">
                    Sign in
                  </a>
                </div>
              ) : !cart.length ? (
                <div className="empty">
                  Your cart is empty. <a href="/products">Browse products</a>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    try {
                      const data = Object.fromEntries(new FormData(e.currentTarget));
                      const r = await api("order", { ...data, cart });
                      setSuccess(r.id);
                      setCart([]);
                    } catch (e: any) {
                      toast.error(e.message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <div className="notice">
                    Sample checkout — requests are saved for demonstration. No real purchase or
                    delivery is arranged.
                  </div>
                  <div className="form-grid">
                    {field("name", "Full name")}
                    {field("phone", "Mobile number", "tel")}
                    {field("email", "Email", "email", true, user.email)}
                    {field("address", "Street address", "text", false)}
                    {field("city", "City", "text", false, "Thirthahalli")}
                    {field("district", "District", "text", false, "Shivamogga")}
                    {field("state", "State", "text", false, "Karnataka")}
                    {field("pin", "PIN code", "text", false)}
                    {field("landmark", "Landmark", "text", false)}
                  </div>
                  <label className="field">
                    Delivery type
                    <Select name="delivery" defaultValue="Store Pickup">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Store Pickup">Store Pickup</SelectItem>
                        <SelectItem value="Home Delivery">Home Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  <label className="field">
                    Payment method
                    <Select name="payment" defaultValue="Pay at Store">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pay at Store">Pay at Store</SelectItem>
                        <SelectItem value="Cash on Delivery">Cash on Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  <h2>Total: {money(total)}</h2>
                  <p>Delivery charges and final availability require store confirmation.</p>
                  <button className="btn" disabled={busy}>
                    {busy ? "Saving..." : "Save sample order"} <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </main>
          ) : ["login", "register"].includes(route) ? (
            <main className="narrow empty">
              <User size={35} />
              <h1>Welcome to Liyas</h1>
              <p>
                Account access is available in local development when LOCAL_DEV_AUTH is enabled.
              </p>
              <a className="btn" href="/" target="_top">
                Return to shop <ArrowRight size={16} />
              </a>
            </main>
          ) : route === "account" ? (
            <main>
              <h1>Your account</h1>
              {loading ? (
                <p>Loading your account…</p>
              ) : !user ? (
                <div className="empty">
                  <p>Sign in to view your orders and saved favourites.</p>
                  <a className="btn" href="/login">
                    Sign in
                  </a>
                </div>
              ) : (
                <>
                  <p>Welcome, {user.name}</p>
                  <Tabs defaultValue="orders">
                    <TabsList>
                      <TabsTrigger value="orders">My orders</TabsTrigger>
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                    </TabsList>
                    <TabsContent value="orders">
                      {orders.length ? (
                        orders.map((o) => (
                          <div className="order" key={o.id}>
                            <div>
                              <b>{o.id}</b>
                              <p>
                                {new Date(o.created).toLocaleDateString("en-IN")} · Sample order
                              </p>
                              <p>{o.items.map((i: any) => i.name + " × " + i.qty).join(", ")}</p>
                            </div>
                            <div>
                              <b>{money(o.total)}</b>
                              <p>
                                {o.status} · {o.paymentStatus}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty">
                          <ShoppingBag />
                          <h2>Your story starts here.</h2>
                          <p>No orders yet.</p>
                          <a href="/products" className="btn">
                            Explore the collection
                          </a>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="profile" className="tab-copy">
                      <h3>{user.name}</h3>
                      <p>{user.email}</p>
                      <a href="/wishlist">View wishlist →</a>
                      <p>
                        <a href="/" target="_top">
                          Back to shop
                        </a>
                      </p>
                      {user.admin && <a href="/admin">Open store management →</a>}
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </main>
          ) : route === "contact" ? (
            <main>
              <div className="collection-heading">
                <span className="eyebrow">LET’S TALK ABOUT YOUR HOME</span>
                <h1>A friendly face. Just around the corner.</h1>
              </div>
              <div className="contact-layout">
                <div>
                  <h2>Visit our showroom</h2>
                  <p>{address}</p>
                  <p>
                    Visit the store to confirm opening hours, delivery options and product
                    availability.
                  </p>
                  <a className="btn" href={maps} target="_blank" rel="noreferrer">
                    Get directions <MapPin size={17} />
                  </a>
                  <iframe
                    title="Liyas store location"
                    src={
                      "https://maps.google.com/maps?q=" +
                      encodeURIComponent(address) +
                      "&output=embed"
                    }
                    loading="lazy"
                  />
                  <p className="sample-note">
                    Phone, WhatsApp and email details will be available once confirmed by the store.
                  </p>
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    const form = e.currentTarget;
                    try {
                      await api("contact", Object.fromEntries(new FormData(form)));
                      toast.success("Your enquiry has been saved.");
                      form.reset();
                    } catch (e: any) {
                      toast.error(e.message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <h2>How can we help?</h2>
                  <div className="form-grid">
                    {field("name", "Your name")}
                    {field("phone", "Phone", "tel")}
                    {field("email", "Email", "email")}
                    {field("subject", "Subject")}
                  </div>
                  <label className="field">
                    Message
                    <textarea name="message" minLength={10} maxLength={3000} required rows={5} />
                  </label>
                  <button className="btn" disabled={busy}>
                    {busy ? "Saving..." : "Send enquiry"} <ArrowRight size={16} />
                  </button>
                  {!user && (
                    <p className="sample-note">
                      <a href="/login">Sign in</a> to save your enquiry.
                    </p>
                  )}
                </form>
              </div>
            </main>
          ) : route === "about" ? (
            <main>
              <div className="about">
                <div>
                  <span className="eyebrow">ROOTED IN THIRTHAHALLI</span>
                  <h1>
                    Good things.
                    <br />
                    For the place
                    <br />
                    you call home.
                  </h1>
                  <p>
                    Liyas Electronics & Furniture brings electronics, home appliances and furniture
                    together in one neighbourhood showroom.
                  </p>
                  <p>
                    From everyday essentials to a fresh start for your living room, explore
                    practical choices with friendly local support. Visit us in Seebinakere, on
                    Sagara Road, and find the right fit for your home.
                  </p>
                  <a href="/contact" className="btn">
                    Visit Liyas <ArrowRight size={16} />
                  </a>
                </div>
                <img src="/images/hero.jpg" alt="Inviting furnished home" />
              </div>
            </main>
          ) : route === "admin" ? (
            <main>
              <h1>Store management</h1>
              {!admin ? (
                <p>Loading…</p>
              ) : admin.error ? (
                <div className="empty">
                  <ShieldCheck />
                  <h2>Administrator access required</h2>
                  <p>{admin.error}</p>
                  <a href="/account" className="btn">
                    My account
                  </a>
                </div>
              ) : (
                <>
                  <div className="admin-stats">
                    <div>
                      <small>Products</small>
                      <h2>{admin.products.length}</h2>
                    </div>
                    <div>
                      <small>Orders</small>
                      <h2>{admin.orders.length}</h2>
                    </div>
                    <div>
                      <small>Pending</small>
                      <h2>{admin.orders.filter((o: any) => o.status === "Pending").length}</h2>
                    </div>
                    <div>
                      <small>Sample order value</small>
                      <h2>{money(admin.orders.reduce((s: number, o: any) => s + o.total, 0))}</h2>
                    </div>
                  </div>
                  <Tabs defaultValue={path[1] || "products"}>
                    <TabsList>
                      {[
                        "products",
                        "orders",
                        "customers",
                        "categories",
                        "brands",
                        "offers",
                        "reviews",
                        "enquiries",
                      ].map((v) => (
                        <TabsTrigger value={v} key={v}>
                          {v}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {["products", "categories", "brands", "offers", "reviews"].map((v) => (
                      <TabsContent key={v} value={v}>
                        <button
                          className="btn"
                          onClick={() =>
                            setEdit({
                              kind: v === "categories" ? "category" : v.slice(0, -1),
                              id: crypto.randomUUID(),
                              data:
                                v === "products"
                                  ? {
                                      name: "",
                                      brand: "Liyas Living",
                                      category: "Sofas",
                                      group: "Furniture",
                                      price: 0,
                                      original: 0,
                                      stock: 0,
                                      image: "",
                                      description: "",
                                      featured: false,
                                    }
                                  : { name: "", description: "" },
                            })
                          }
                        >
                          Add {v === "categories" ? "category" : v.slice(0, -1)} <Plus size={16} />
                        </button>
                        {admin[v].map((p: any) => (
                          <div className="order" key={p.id}>
                            <div>
                              <b>{p.name || p.title || p.id}</b>
                              <p>
                                {p.price !== undefined
                                  ? money(p.price) + " · Stock: " + p.stock
                                  : p.description}
                              </p>
                            </div>
                            <button
                              className="btn outline"
                              onClick={() =>
                                setEdit({
                                  kind: v === "categories" ? "category" : v.slice(0, -1),
                                  id: p.id,
                                  data: p,
                                })
                              }
                            >
                              Edit
                            </button>
                          </div>
                        ))}
                      </TabsContent>
                    ))}
                    <TabsContent value="orders">
                      {admin.orders.map((o: any) => (
                        <div className="order" key={o.id}>
                          <div>
                            <b>
                              {o.id} · {o.name}
                            </b>
                            <p>
                              {money(o.total)} · {o.phone}
                            </p>
                          </div>
                          <Select
                            value={o.status}
                            onValueChange={async (status) => {
                              try {
                                await api("admin", { status }, { kind: "order", id: o.id });
                                setAdmin({
                                  ...admin,
                                  orders: admin.orders.map((x: any) =>
                                    x.id === o.id ? { ...x, status } : x,
                                  ),
                                });
                              } catch (e: any) {
                                toast.error(e.message);
                              }
                            }}
                          >
                            <SelectTrigger className="sort">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "Pending",
                                "Confirmed",
                                "Processing",
                                "Out for Delivery",
                                "Delivered",
                                "Cancelled",
                              ].map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="customers">
                      {Array.from(new Set(admin.orders.map((o: any) => o.email))).map(
                        (email: any) => (
                          <div className="order" key={email}>
                            <b>{email}</b>
                            <span>
                              {admin.orders.filter((o: any) => o.email === email).length} orders
                            </span>
                          </div>
                        ),
                      )}
                    </TabsContent>
                    <TabsContent value="enquiries">
                      {admin.enquiries.map((e: any) => (
                        <div className="order" key={e.id}>
                          <div>
                            <b>{e.subject}</b>
                            <p>{e.message}</p>
                            <small>
                              {e.name} · {e.email} · {e.phone}
                            </small>
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </>
              )}
              <Dialog open={!!edit} onOpenChange={(v) => !v && setEdit(null)}>
                <DialogContent className="editor">
                  <DialogHeader>
                    <DialogTitle>Edit {edit?.kind}</DialogTitle>
                  </DialogHeader>
                  {edit && (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          await api("admin", edit.data, { kind: edit.kind, id: edit.id });
                          toast.success("Saved");
                          setEdit(null);
                          setAdmin(await (await fetch("/api/shop?type=admin")).json());
                          load();
                        } catch (e: any) {
                          toast.error(e.message);
                        }
                      }}
                    >
                      {Object.entries(edit.data)
                        .filter(([k]) => !["id", "created"].includes(k))
                        .map(([k, v]) => (
                          <label className="field" key={k}>
                            {k}
                            {typeof v === "boolean" ? (
                              <Checkbox
                                checked={v}
                                onCheckedChange={(value) =>
                                  setEdit({ ...edit, data: { ...edit.data, [k]: !!value } })
                                }
                              />
                            ) : (
                              <input
                                value={String(v ?? "")}
                                type={typeof v === "number" ? "number" : "text"}
                                onChange={(e) =>
                                  setEdit({
                                    ...edit,
                                    data: {
                                      ...edit.data,
                                      [k]:
                                        typeof v === "number"
                                          ? Number(e.target.value)
                                          : e.target.value,
                                    },
                                  })
                                }
                              />
                            )}
                          </label>
                        ))}
                      <button className="btn">Save changes</button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </main>
          ) : (
            <main className="empty">
              <h1>Page not found</h1>
              <a href="/">Return home</a>
            </main>
          )}
         <footer className="bg-[#26231f] text-[#f4efe5]">
  <div className="mx-auto max-w-[1500px] px-6 py-2 sm:px-10 lg:px-16 ">

    {/* TOP */}
    <div className="grid gap-12 border-b border-white/10 pb-14 lg:grid-cols-[1.4fr_0.7fr_0.8fr_1fr] lg:gap-16">

      {/* BRAND */}
      <div>
        <a
          href="/"
          aria-label="Liya’s Furniture & Electronics — Home"
          className="inline-block"
        >
          <img
            src="/images/liyas-logo.png"
            alt="Liya’s Furniture & Electronics"
            className="h-[202px] w-auto object-contain "
          />
        </a>

        <p className="mt-7 max-w-[380px] text-[15px] leading-7 text-white/65">
          Thoughtful choices for better living.
          <br />
          Your neighbourhood home store in Thirthahalli.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <span className="h-px w-10 bg-white/30" />

          <span className="text-[10px] uppercase tracking-[0.28em] text-black/60">
            Furniture • Electronics • Home
          </span>
        </div>
      </div>

      {/* EXPLORE */}
      <div>
        <h4 className="mb-6 text-[11px] font-medium uppercase tracking-[0.28em] text-black/60">
          Explore
        </h4>

        <div className="flex flex-col gap-4">
          <a
            href="/electronics"
            className="w-fit text-[15px] text-white/80 transition-colors hover:text-white"
          >
            Electronics
          </a>

          <a
            href="/furniture"
            className="w-fit text-[15px] text-white/80 transition-colors hover:text-white"
          >
            Furniture
          </a>

          <a
            href="/offers"
            className="w-fit text-[15px] text-white/80 transition-colors hover:text-white"
          >
            Offers
          </a>

          <a
            href="/products"
            className="w-fit text-[15px] text-white/80 transition-colors hover:text-white"
          >
            All products
          </a>
        </div>
      </div>

      {/* HELP */}
      <div>
        <h4 className="mb-6 text-[11px] font-medium uppercase tracking-[0.28em] text-black/60">
          Here to help
        </h4>

        <div className="flex flex-col gap-4">
          <a
            href="/about"
            className="w-fit text-[15px] text-white/80 transition-colors hover:text-white"
          >
            About Liya’s
          </a>

          <a
            href="/contact"
            className="w-fit text-[15px] text-white/80 transition-colors hover:text-white"
          >
            Contact & location
          </a>

          <a
            href="/account"
            className="w-fit text-[15px] text-white/80 transition-colors hover:text-white"
          >
            My account
          </a>

          <a
            href="/account"
            className="w-fit text-[15px] text-white/80 transition-colors hover:text-white"
          >
            Track your orders
          </a>
        </div>
      </div>

      {/* LOCATION */}
      <div>
        <h4 className="mb-6 text-[11px] font-medium uppercase tracking-[0.28em] text-black/60">
          Come say hello
        </h4>

        <p className="max-w-[280px] text-[15px] leading-7 text-white/70">
          {address}
        </p>

        <a
          href={maps}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-3 border-b border-white/30 pb-1 text-[14px] text-white transition-colors hover:border-white"
        >
          Get directions
          <ArrowUpRight size={15} />
        </a>
      </div>

    </div>



    {/* BOTTOM */}
    <div className="flex flex-col gap-4  text-[12px] text-black/50 sm:flex-row sm:items-center sm:justify-between">
      <span>
        © {new Date().getFullYear()} Liya’s Electronics & Furniture
      </span>

      <span>
        Made for your home. Rooted in Thirthahalli.
      </span>
    </div>

  </div>
</footer>
        </div>
      </div>
      <a className="floating-help" href="/contact" aria-label="Contact the store">
        <MessageCircle size={23} />
      </a>
    </>
  );
}
