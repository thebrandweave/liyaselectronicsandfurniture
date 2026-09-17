"use client";
import { useEffect, useRef, useState } from "react";
// import InteriorMotion from "@/components/interior-motion";
import ShowroomHome from "@/components/showroom-home";
import Link from "next/link";
import Image from "next/image";


import { FaInstagram, FaFacebookF, FaYoutube,FaWhatsapp } from "react-icons/fa";

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
  Phone,
  Monitor,
  Check,
  MessageCircle,
    LogOut,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
const address =
  "Sheshashayi Complex, Seebinakere, Sagara Road, Thirthahalli, Karnataka";
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
    [edit, setEdit] = useState<any>(null),
    [uploadingImage, setUploadingImage] = useState(false);
  const [megaMenu, setMegaMenu] = useState<"Electronics" | "Furniture" | null>(
    null,
  );
  const megaNavRef = useRef<HTMLElement>(null);
  const megaTriggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const megaCategories = megaMenu
    ? Array.from(
        new Set(
          products.filter((p) => p.group === megaMenu).map((p) => p.category),
        ),
      ).map((name) => ({
        name,
        image: products.find(
          (p) => p.group === megaMenu && p.category === name && p.image,
        )?.image,
      }))
    : [];

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!megaNavRef.current?.contains(event.target as Node))
        setMegaMenu(null);
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onResize = () => {
      if (!desktop.matches) setMegaMenu(null);
    };
    document.addEventListener("pointerdown", dismiss);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      desktop.removeEventListener("change", onResize);
    };
  }, []);

  useEffect(() => {
    const header = document.querySelector("header");
    const topbar = document.querySelector(".topbar");
    const measure = () => {
      const h =
        (header?.getBoundingClientRect().height || 0) +
        (topbar?.getBoundingClientRect().height || 0);
      document.documentElement.style.setProperty(
        "--site-header-height",
        h + "px",
      );
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
          const guest = JSON.parse(
            localStorage.getItem("liyas-guest-cart") || "[]",
          );
          if (guest.length) {
            const merged = [...(d.state.cart || [])];
            for (const i of guest) {
              const old = merged.find((x: any) => x.id === i.id);
              if (old) old.qty = Math.min(20, old.qty + i.qty);
              else merged.push(i);
            }
            await api("state", {
              cart: merged,
              wishlist: d.state.wishlist || [],
            });
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
  async function uploadProductImage(file: File) {
    if (!file) return;

    const form = new FormData();
    form.append("image", file);

    setUploadingImage(true);

    try {
      const r = await fetch("/api/shop/upload", {
        method: "POST",
        body: form,
      });

      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Unable to upload image.");

      setEdit((current: any) =>
        current
          ? {
              ...current,
              data: {
                ...current.data,
                image: d.url,
              },
            }
          : current,
      );

      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e.message || "Unable to upload image.");
    } finally {
      setUploadingImage(false);
    }
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

    const LogoSet = () => (
    <div className="flex shrink-0 items-center gap-12 pr-12 md:gap-24 md:pr-24">
  
      <div className="flex shrink-0 items-center justify-center">
        <Image
          src="/images/4.png"
          alt="Client Partner Logo 1"
          width={160}
          height={72}
          draggable={false}
          className="h-12 w-auto max-w-[140px] object-contain sm:h-16 sm:max-w-[180px]"
        />
      </div>
  
      <div className="flex shrink-0 items-center justify-center">
        <Image
          src="/images/5.png"
          alt="Client Partner Logo 2"
          width={160}
          height={72}
          draggable={false}
          className="h-12 w-auto max-w-[140px] object-contain sm:h-16 sm:max-w-[180px]"
        />
      </div>
  
      <div className="flex shrink-0 items-center justify-center">
        <Image
          src="/images/6.png"
          alt="Client Partner Logo 3"
          width={160}
          height={72}
          draggable={false}
          className="h-12 w-auto max-w-[140px] object-contain sm:h-14 sm:max-w-[180px]"
        />
      </div>
  
      <div className="flex shrink-0 items-center justify-center">
        <Image
          src="/images/7.png"
          alt="Client Partner Logo 4"
          width={160}
          height={72}
          draggable={false}
          className="h-12 w-auto max-w-[140px] object-contain sm:h-28 sm:max-w-[180px]"
        />
      </div>
  
      <div className="flex shrink-0 items-center justify-center">
        <Image
          src="/images/8.png"
          alt="Client Partner Logo 5"
          width={160}
          height={72}
          draggable={false}
          className="h-12 w-auto max-w-[140px] object-contain sm:h-20 sm:max-w-[180px]"
        />
      </div>
  
      <div className="flex shrink-0 items-center justify-center">
        <Image
          src="/images/9.png"
          alt="Client Partner Logo 6"
          width={160}
          height={72}
          draggable={false}
          className="h-12 w-auto max-w-[140px] object-contain sm:h-28 sm:max-w-[180px]"
        />
      </div>
  
      <div className="flex shrink-0 items-center justify-center">
        <Image
          src="/images/101.png"
          alt="Client Partner Logo 7"
          width={160}
          height={72}
          draggable={false}
          className="h-12 w-auto max-w-[140px] object-contain sm:h-12 sm:max-w-[180px]"
        />
      </div>
  
      <div className="flex shrink-0 items-center justify-center">
        <Image
          src="/images/111.png"
          alt="Client Partner Logo 8"
          width={160}
          height={72}
          draggable={false}
          className="h-12 w-auto max-w-[140px] object-contain sm:h-28 sm:max-w-[180px]"
        />
      </div>
  
      <div className="flex shrink-0 items-center justify-center">
        <Image
          src="/images/12.png"
          alt="Client Partner Logo 9"
          width={160}
          height={72}
          draggable={false}
          className="h-12 w-auto max-w-[140px] object-contain sm:h-12 sm:max-w-[180px]"
        />
      </div>
  
      <div className="flex shrink-0 items-center justify-center">
        <Image
          src="/images/13.png"
          alt="Client Partner Logo 10"
          width={160}
          height={72}
          draggable={false}
          className="h-12 w-auto max-w-[140px] object-contain sm:h-8 sm:max-w-[180px]"
        />
      </div>
  <div className="flex shrink-0 items-center justify-center">
        <Image
          src="/images/14.png"
          alt="Client Partner Logo 10"
          width={160}
          height={72}
          draggable={false}
          className="h-12 w-auto max-w-[140px] object-contain sm:h-20 sm:max-w-[180px]"
        />
      </div>
      <div className="flex shrink-0 items-center justify-center">
        <Image
          src="/images/15.png"
          alt="Client Partner Logo 10"
          width={160}
          height={72}
          draggable={false}
          className="h-12 w-auto max-w-[140px] object-contain sm:h-20 sm:max-w-[180px]"
        />
      </div>
      <div className="flex shrink-0 items-center justify-center">
        <Image
          src="/images/16.png"
          alt="Client Partner Logo 10"
          width={160}
          height={72}
          draggable={false}
          className="h-12 w-auto max-w-[140px] object-contain sm:h-25 sm:max-w-[180px]"
        />
      </div>
       <div className="flex shrink-0 items-center justify-center">
        <Image
          src="/images/17.png"
          alt="Client Partner Logo 10"
          width={160}
          height={72}
          draggable={false}
          className="h-12 w-auto max-w-[140px] object-contain sm:h-35 sm:max-w-[180px]"
        />
      </div>
    </div>
  );
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
    persist(
      cart,
      wish.includes(p.id) ? wish.filter((i) => i !== p.id) : [...wish, p.id],
    );
  }
  const count = cart.reduce((s, i) => s + i.qty, 0),
    total = cart.reduce(
      (s, i) => s + (products.find((p) => p.id === i.id)?.price || 0) * i.qty,
      0,
    );
  const filtered = products
    .filter(
      (p) =>
        (!["electronics", "furniture"].includes(route) ||
          p.group.toLowerCase() === route) &&
        (route !== "offers" || p.original > p.price) &&
        (route !== "wishlist" || wish.includes(p.id)) &&
        (category === "All" || p.category === category) &&
        (brand === "All" || p.brand === brand) &&
        (max === "" || p.price <= Number(max)) &&
        (!stock || p.stock > 0) &&
        (p.name + " " + p.brand + " " + p.category)
          .toLowerCase()
          .includes(query.toLowerCase()),
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
          <span className="discount">
            {Math.round((1 - p.price / p.original) * 100)}% OFF
          </span>
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
            <strong>{money(p.price)}</strong>
            <del>{money(p.original)}</del>
          </div>
        </div>
      </article>
    );
  }
  function field(
    name: string,
    label: string,
    type = "text",
    required = true,
    value?: string,
  ) {
    return (
      <label className="field">
        {label}
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={value}
        />
      </label>
    );
  }
  return (
    <>
      {/* <InteriorMotion enabled={route === "home" || route === "about"} /> */}
      <Toaster position="bottom-center" />
      <style>{`
        .liyas-mega-nav { position: relative; overflow: visible; }
        .liyas-mega-nav .liyas-mega-links { height: 100%; }
        .liyas-mega-nav .liyas-mega-item { position: static; height: 100%; display: flex; align-items: center; }
        .liyas-mega-nav .liyas-mega-trigger { display: flex; align-items: center; gap: 8px; height: 100%; min-height: 44px; border: 0; background: transparent; color: inherit; padding: 0; font: inherit; text-transform: inherit; cursor: pointer; }
        .liyas-mega-nav .liyas-mega-trigger[aria-expanded="true"], .liyas-mega-nav .liyas-mega-trigger.active { color: #950089; }
        .liyas-mega-nav .liyas-chevron { transform: rotate(90deg); }
        .liyas-mega-nav .liyas-chevron-open { transform: rotate(-90deg); }
        .liyas-mega-nav .liyas-mega-panel { position: absolute; top: 100%; left: 0; right: 0; width: 100%; z-index: 60; background: white; color: #222; border-top: 1px solid #e8e4df; border-bottom: 1px solid #e8e4df; box-shadow: 0 16px 26px #00000012; padding: 28px 4% 32px; max-height: 70dvh; overflow-y: auto; text-transform: none; font-weight: 400; }
        .liyas-mega-nav .liyas-mega-heading { display: flex; align-items: center; gap: 24px; margin-bottom: 24px; }
        .liyas-mega-nav .liyas-mega-heading h2 { font-family: "Cormorant", Georgia, serif; font-size: 32px; line-height: 1.2; font-weight: 500; margin: 0; }
        .liyas-mega-nav .liyas-mega-heading > a { display: inline-flex; align-items: center; gap: 8px; width: auto; height: auto; margin-left: auto; font-size: 14px; min-height: 44px; }
        .liyas-mega-nav .liyas-mega-heading > button { display: grid; place-items: center; width: 44px; height: 44px; border: 1px solid #e8e4df; background: white; cursor: pointer; }
        .liyas-mega-nav .liyas-mega-categories { display: flex; gap: 22px; overflow-x: auto; padding-bottom: 12px; }
        .liyas-mega-nav .liyas-mega-card { display: flex; flex-direction: column; align-items: stretch; gap: 13px; position: relative; flex: 0 0 calc((100% - 110px) / 6); min-width: 150px; height: auto; color: #222; }
        .liyas-mega-nav .liyas-mega-image { display: grid; place-items: center; width: 100%; aspect-ratio: 1.15; padding: 0px; overflow: hidden; background: #f4f3f1; }
        .liyas-mega-nav .liyas-mega-image img { width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply; }
        .liyas-mega-nav .liyas-mega-title { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 14px; font-weight: 500; line-height: 1.5; }
        .liyas-mega-nav .liyas-mega-card:hover, .liyas-mega-nav .liyas-mega-heading > a:hover { color: #950089; }
        .liyas-mega-nav a:focus-visible, .liyas-mega-nav button:focus-visible { outline: 2px solid #950089; outline-offset: 4px; }
        .liyas-mega-nav .liyas-mega-empty { font-size: 14px; margin: 0; }
        @media (max-width: 1023px) { .liyas-mega-nav { display: none !important; } }
      `}</style>
      <div className="topbar">
        <span>
          <MapPin size={13} /> Your neighbourhood showroom in Thirthahalli
        </span>
        <span>
          Good homes start with great choices{" "}
          <span className="top-divider">|</span>{" "}
          <a href="/contact">
            Visit our store <ArrowRight size={12} />
          </a>
        </span>
      </div>
      <header className="relative z-50 w-full">
        <div className="main-header mx-auto flex w-full items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
          <a
            className="logo brand-logo shrink-0"
            href="/"
            aria-label="Liya’s Furniture & Electronics — Home"
          >
            <span className="logo-crop block">
              <img
                src="/images/liyas-logo.png"
                alt="Liya’s Furniture & Electronics"
                className="block h-auto max-w-full"
              />
            </span>
          </a>
          <form className="search hidden min-w-0 flex-1 items-center lg:flex" action="/products">
            <Search size={18} />
            <input
              name="q"
              placeholder="Search for a sofa, TV, refrigerator..."
              aria-label="Search products"
              className="min-w-0 flex-1"
            />
            <button type="submit" className="shrink-0">Search</button>
          </form>
          <div className="header-actions ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <a href="/account" aria-label="My account">
              <User />
              {/* <span>Account</span> */}
            </a>
            <a href="/wishlist" aria-label="Wishlist">
              <Heart />
              {/* <span>Wishlist</span> */}
            </a>
            <a
              className="cart-icon relative"
              href="/cart"
              aria-label={"Cart with " + count + " items"}
            >
              <ShoppingBag />
              <i>{count}</i>
              {/* <span>Cart</span> */}
            </a>
            <Sheet open={mobile} onOpenChange={setMobile}>
              <SheetTrigger asChild>
                <button
                  className="mobile-toggle inline-flex items-center justify-center lg:hidden"
                  aria-label="Open navigation menu"
                >
                  <Menu size={24} />
                </button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="mobile-menu-sheet w-[88vw] max-w-[380px] p-0 sm:w-[380px]"
                showCloseButton={false}
              >
                <SheetHeader className="mobile-menu-heading flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                  <SheetTitle className="sr-only">Liya’s navigation</SheetTitle>
                  <SheetDescription className="sr-only">
                    Explore furniture, electronics and your account.
                  </SheetDescription>
                  <a
                    className="brand-logo shrink-0"
                    href="/"
                    onClick={() => setMobile(false)}
                    aria-label="Liya’s home"
                  >
                    <span className="logo-crop block">
                      <img
                        src="/images/liyas-logo.png"
                        alt="Liya’s Furniture & Electronics"
                      />
                    </span>
                  </a>
                  <SheetClose asChild>
                    <button
                      className="drawer-close inline-flex shrink-0 items-center justify-center"
                      aria-label="Close navigation menu"
                    >
                      <X size={23} />
                    </button>
                  </SheetClose>
                </SheetHeader>
                <div className="mobile-menu-scroll h-[calc(100vh-76px)] overflow-y-auto px-5 pb-8 sm:px-6">
                  <form
                    className="drawer-search flex w-full items-center gap-2"
                    action="/products"
                    onSubmit={() => setMobile(false)}
                  >
                    <Search size={19} />
                    <input
                      name="q"
                      placeholder="Find something for your home"
                      aria-label="Search products"
                      className="min-w-0 flex-1"
                    />
                    <button type="submit" aria-label="Submit product search" className="shrink-0">
                      <ArrowRight size={20} />
                    </button>
                  </form>
                  <div
                    className="drawer-nav mt-5 flex flex-col"
                    role="navigation"
                    aria-label="Mobile navigation"
                  >
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
                        <span className="min-w-0 flex-1">{label}</span>
                        <ChevronRight size={18} />
                      </a>
                    ))}
                  </div>
                  <div className="drawer-account mt-6 flex flex-col">
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
                  <div className="drawer-visit mt-6 flex items-start gap-3">
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
        <nav
          ref={megaNavRef}
          className="desktop-nav liyas-mega-nav relative hidden w-full uppercase font-bold lg:block"
          aria-label="Main navigation"
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            )
              setMegaMenu(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && megaMenu) {
              event.preventDefault();
              megaTriggers.current[megaMenu]?.focus();
              setMegaMenu(null);
            }
          }}
        >
          <div className="liyas-mega-links mx-auto flex w-full items-center justify-center gap-1 px-4 sm:px-6 lg:px-8">
            {[
              ["/", "Home"],
              ["/about", "About Us"],
              ["/products", "All Products"],
              ["/electronics", "Electronics"],
              ["/furniture", "Furniture"],
              ["/offers", "Offers"],
              ["/contact", "Contact Us"],
            ].map(([url, label]) => {
              const group =
                label === "Electronics" || label === "Furniture" ? label : null;
              const active =
                route === "home" ? url === "/" : url === "/" + route;
              return group ? (
                <div
                  className="liyas-mega-item static"
                  key={url}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setMegaMenu(group);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === "mouse") setMegaMenu(null);
                  }}
                >
                  <button
                    type="button"
                    ref={(node) => {
                      megaTriggers.current[group] = node;
                    }}
                    className={`liyas-mega-trigger flex items-center gap-1 whitespace-nowrap ${active ? "active" : ""}`}
                    aria-expanded={megaMenu === group}
                    aria-controls={`liyas-mega-${group.toLowerCase()}`}
                    onClick={() =>
                      setMegaMenu(megaMenu === group ? null : group)
                    }
                  >
                    {label}
                    <ChevronRight
                      size={15}
                      aria-hidden="true"
                      className={
                        megaMenu === group
                          ? "liyas-chevron-open"
                          : "liyas-chevron"
                      }
                    />
                  </button>
                  {megaMenu === group && (
                    <section
                      id={`liyas-mega-${group.toLowerCase()}`}
                      className="liyas-mega-panel absolute left-0 top-full z-50 w-full overflow-hidden"
                      aria-label={`${group} categories`}
                    >
                      <div className="liyas-mega-heading mx-auto w-full max-w-[1500px] px-6 pt-5 lg:px-10">
                        {/* <h2>Explore {group.toLowerCase()}</h2> */}
                      
                      
                      </div>
                      <div className="liyas-mega-categories mx-auto grid w-full max-w-[1500px] grid-cols-2 gap-3 px-6 pb-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 lg:px-10">
                        {megaCategories.map((item) => (
                          <a
                            key={item.name}
                            className="liyas-mega-card group min-w-0"
                            href={`/products?category=${encodeURIComponent(item.name)}`}
                            onClick={() => setMegaMenu(null)}
                          >
                            <span className="liyas-mega-image block w-full overflow-hidden">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt=""
                                  loading="lazy"
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <ShoppingBag size={36} aria-hidden="true" />
                              )}
                            </span>
                            <span className="liyas-mega-title flex items-center justify-between gap-2">
                              {item.name}
                              <ArrowUpRight size={16} aria-hidden="true" />
                            </span>
                          </a>
                        ))}
                      </div>
                      {!megaCategories.length && (
                        <p className="liyas-mega-empty mx-auto w-full max-w-[1500px] px-6 pb-6 lg:px-10">
                          No categories available yet.
                        </p>
                      )}
                    </section>
                  )}
                </div>
              ) : (
                <a
                  className={`${active ? "active" : ""} relative whitespace-nowrap`}
                  key={url}
                  href={url}
                  onClick={() => setMegaMenu(null)}
                >
                  {label}
                  {label === "Offers" && <span className="nav-tag absolute -right-2 -top-2">SALE</span>}
                </a>
              );
            })}
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
          ) : [
              "products",
              "electronics",
              "furniture",
              "offers",
              "wishlist",
            ].includes(route) && path.length < 2 ? (
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
              {/* MOBILE / TABLET FILTER DROPDOWN */}
              <details className="group mb-5 w-full lg:hidden">
                <summary className="flex w-full cursor-pointer list-none items-center justify-between border border-[#26231f]/15 bg-white px-4 py-3 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2">
                    Filter
                    <img
                      src="/images/filter.png"
                      alt=""
                      aria-hidden="true"
                      className="h-4 w-4 object-contain"
                    />
                  </span>
                  <ChevronRight
                    size={18}
                    className="transition-transform duration-200 group-open:rotate-90"
                  />
                </summary>

                <div className="mt-2 border border-[#26231f]/15 bg-white p-4 shadow-sm sm:p-5">

                  <label className="field">
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
                          ...new Set([
                            ...categories,
                            ...products.map((p) => p.category),
                          ]),
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
                        {["All", ...new Set(products.map((p) => p.brand))].map(
                          (c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ),
                        )}
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
                    <Checkbox
                      checked={stock}
                      onCheckedChange={(v) => setStock(!!v)}
                    />{" "}
                    In stock only
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

                </div>
              </details>

              <div className="catalog">
                <aside className="hidden lg:block">
                  <h3 className="my-2 flex">
                    Filter
                    <img
                      src="/images/filter.png"
                      alt="Filter"
                      className="ml-2 mt-1 h-4 w-4"
                    />
                  </h3>
                  <label className="field">
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
                          ...new Set([
                            ...categories,
                            ...products.map((p) => p.category),
                          ]),
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
                        {["All", ...new Set(products.map((p) => p.brand))].map(
                          (c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ),
                        )}
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
                    <Checkbox
                      checked={stock}
                      onCheckedChange={(v) => setStock(!!v)}
                    />{" "}
                    In stock only
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
                <div className="min-w-0">
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
                  <div className="product-grid three grid grid-cols-3 gap-6 max-[1101px]:grid-cols-2 max-[1024px]:gap-5 max-[761px]:gap-[14px] max-[480px]:grid-cols-1">
                    {filtered.map(card)}
                  </div>
                  {!filtered.length && (
                    <div className="empty">
                      <Heart />
                      <h3>
                        {route === "wishlist"
                          ? "Your wishlist is waiting"
                          : "No products found"}
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
                        {p.stock} available in sample catalogue · SKU:{" "}
                        {p.id.toUpperCase()}
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
                              [
                                ...cart.filter((i) => i.id !== p.id),
                                { id: p.id, qty },
                              ],
                              wish,
                            );
                            toast.success("Added to cart");
                          }}
                        >
                          Add to cart <ShoppingBag size={17} />
                        </button>
                        <button
                          className="btn outline"
                          onClick={() => wishlist(p)}
                        >
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
                        Sample item. Orders are demonstration requests and do
                        not reserve actual stock.
                      </p>
                    </div>
                  </div>
                  <Tabs defaultValue="Description">
                    <TabsList>
                      {[
                        "Description",
                        "Specifications",
                        "Warranty",
                        "Delivery",
                        "Reviews",
                      ].map((t) => (
                        <TabsTrigger key={t} value={t}>
                          {t}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {[
                      "Description",
                      "Specifications",
                      "Warranty",
                      "Delivery",
                      "Reviews",
                    ].map((t) => (
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
                    ))}
                  </Tabs>
                  <h2>You may also like</h2>
                  <div className="product-grid grid grid-cols-4 gap-6 max-[1024px]:gap-5 max-[761px]:grid-cols-2 max-[761px]:gap-[14px] max-[480px]:grid-cols-1">
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
         <main className="mx-auto w-full max-w-[1500px] px-4 py-10 sm:px-8 sm:py-14 lg:px-16 lg:py-20">

  {/* HEADING */}
  <div className="mb-10 sm:mb-14">
    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b0090]">
      Your next home upgrade
    </span>

    <h1 className="mt-3 font-serif text-[40px] leading-none tracking-[-0.03em] text-[#26231f] sm:text-[52px] lg:text-[64px]">
      Your shopping cart
    </h1>

    {cart.length > 0 && (
      <p className="mt-4 text-[14px] text-[#766e65]">
        {count} {count === 1 ? "item" : "items"} waiting for you.
      </p>
    )}
  </div>

  {cart.length ? (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start lg:gap-14">

      {/* CART PRODUCTS */}
      <div className="border-t border-[#26231f]/10">
        {cart.map((i) => {
          const p = products.find((p) => p.id === i.id);

          return (
            p && (
              <div
                key={i.id}
                className="
                  grid
                  grid-cols-[95px_1fr_auto]
                  gap-4
                  border-b
                  border-[#26231f]/10
                  py-6

                  sm:grid-cols-[135px_1fr_auto_auto]
                  sm:items-center
                  sm:gap-6
                  sm:py-7
                "
              >
                {/* IMAGE */}
                <a
                  href={"/products/" + p.id}
                  className="block overflow-hidden "
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="
                      h-[110px]
                      w-full
                      object-contain
                      p-0
                      transition-transform
                      duration-300
                      hover:scale-105
                      sm:h-[130px]
                    "
                  />
                </a>

                {/* DETAILS */}
                <div className="min-w-0">
                  <a href={"/products/" + p.id}>
                    <h3 className="line-clamp-2 text-[16px] font-medium leading-6 text-[#26231f] transition-colors hover:text-[#9b0090] sm:text-[18px]">
                      {p.name}
                    </h3>
                  </a>

                  <p className="mt-2 text-[15px] font-semibold text-[#dda9da]">
                    {money(p.price)}
                  </p>

                  {/* QUANTITY */}
                  <div className="mt-4 inline-flex items-center border border-[#26231f]/15">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="
                        grid
                        h-9
                        w-9
                        place-items-center
                        transition
                        hover:bg-[#f3efe9]
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                      "
                      disabled={i.qty <= 1}
                      onClick={() =>
                        persist(
                          cart.map((x) =>
                            x.id === i.id
                              ? {
                                  ...x,
                                  qty: Math.max(1, x.qty - 1),
                                }
                              : x,
                          ),
                          wish,
                        )
                      }
                    >
                      <Minus size={14} />
                    </button>

                    <span className="grid h-9 min-w-10 place-items-center border-x border-[#26231f]/15 px-2 text-[14px] font-medium">
                      {i.qty}
                    </span>

                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="grid h-9 w-9 place-items-center transition hover:bg-[#f3efe9]"
                      onClick={() => add(p)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* TOTAL */}
                <strong className="hidden whitespace-nowrap text-[16px] font-semibold text-[#26231f] sm:block">
                  {money(p.price * i.qty)}
                </strong>

                {/* REMOVE */}
                <button
                  type="button"
                  aria-label={`Remove ${p.name}`}
                  onClick={() =>
                    persist(
                      cart.filter((x) => x.id !== i.id),
                      wish,
                    )
                  }
                  className="
                    self-start
                    p-2
                    text-[#81786e]
                    transition
                    hover:bg-red-50
                    hover:text-red-500
                    sm:self-center
                  "
                >
                  <Trash2 size={18} />
                </button>

                {/* MOBILE TOTAL */}
                <div className="col-start-2 flex items-center justify-between sm:hidden">
                  <span className="text-[12px] uppercase tracking-[0.1em] text-[#847b70]">
                    Total
                  </span>

                  <strong className="text-[15px] text-[#26231f]">
                    {money(p.price * i.qty)}
                  </strong>
                </div>
              </div>
            )
          );
        })}

        <a
          href="/products"
          className="mt-6 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-[#9b0090]"
        >
          <ArrowRight size={15} className="rotate-180" />
          Continue shopping
        </a>
      </div>

      {/* ORDER SUMMARY */}
      <aside className="lg:sticky lg:top-32">
        <div className="bg-[#dda9da]/20 p-6 sm:p-8">
<div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#9b0090]">
            Your order
          </span>
<span>   <ShoppingBag
              size={20}
              className="mt-[2px] shrink-0 text-[#9b0090]"
            /></span>
</div>
          <h2 className="mt-2 font-serif text-[32px] tracking-[-0.02em] text-[#26231f]">
            Order summary
          </h2>

          <div className="mt-7 space-y-4 text-[14px]">
            <div className="flex items-center justify-between gap-5 text-[#6d655b]">
              <span>Subtotal</span>
              <strong className="text-[#26231f]">
                {money(total)}
              </strong>
            </div>

            <div className="flex items-start justify-between gap-5 text-[#6d655b]">
              <span>Delivery</span>
              <span className="text-right text-[13px]">
                Confirm with store
              </span>
            </div>

            <div className="border-t border-[#26231f]/10 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-[17px] font-medium text-[#26231f]">
                  Total
                </span>

                <strong className="tracking-[-0.02em] font-semibold text-[26px] text-[#9b0090]">
                  {money(total)}
                </strong>
              </div>
            </div>
          </div>

          <Link
            href="/checkout"
            className="
              mt-8
              flex
              w-full
              items-center
              justify-center
              gap-3
              bg-[#9b0090]
              px-6
              py-4
              text-[12px]
              font-semibold
              uppercase
              tracking-[0.12em]
              text-white
              transition
              duration-300
              hover:bg-[#720069]
            "
          >
            <span className="text-white font-inter">Proceed to checkout</span>
            <span className="text-white "><ArrowRight size={16} /></span>
          </Link>

     
        </div>
      </aside>
    </div>
  ) : (

    /* EMPTY CART */
    <div className="mx-auto flex min-h-[420px] max-w-[650px] flex-col items-center justify-center  bg-[#dda9da]/20 px-6 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-[#dda9da]/25 text-[#9b0090]">
        <ShoppingBag size={28} />
      </div>

      <span className="mt-7 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9b0090]">
        Your cart is empty
      </span>

      <h2 className="mt-3 font-serif text-[34px] tracking-[-0.03em] text-[#26231f] sm:text-[42px]">
        A little room for something new.
      </h2>

      <p className="mt-4 max-w-[430px] text-[14px] leading-7 text-[#756d63]">
        Discover furniture, electronics and home essentials made
        for everyday living.
      </p>

      <Link
        href="/products"
        className="
          mt-8
          inline-flex
          items-center
          gap-3
          bg-[#9b0090]
          px-7
          py-4
          text-[12px]
          font-semibold
          uppercase
          tracking-[0.12em]
          text-white
          transition
          hover:bg-[#720069]
        "
      >
        <span className="text-white font-inter">Start exploring</span>
        <span className="text-white "><ArrowRight size={16} /></span>
      </Link>
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
                    Your Order has been Placed.
                  </p>
                  <Link className="btn" href="/account">
                    View my orders
                  </Link>
                </div>
              ) : !user ? (
                <div className="empty">
                  <h2>Sign in to save your order</h2>
                  <Link className="btn" href="/login">
                    Sign in
                  </Link>
                </div>
              ) : !cart.length ? (
                <div className="empty">
                  Your cart is empty. <Link href="/products">Browse products</Link>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    try {
                      const data = Object.fromEntries(
                        new FormData(e.currentTarget),
                      );
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
                    Sample checkout — requests are saved for demonstration. No
                    real purchase or delivery is arranged.
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
                        <SelectItem value="Store Pickup">
                          Store Pickup
                        </SelectItem>
                        <SelectItem value="Home Delivery">
                          Home Delivery
                        </SelectItem>
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
                        <SelectItem value="Pay at Store">
                          Pay at Store
                        </SelectItem>
                        <SelectItem value="Cash on Delivery">
                          Cash on Delivery
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </label>
                  <h2>Total: {money(total)}</h2>
                  <p>
                    Delivery charges and final availability require store
                    confirmation.
                  </p>
                  <button className="btn" disabled={busy}>
                    {busy ? "Saving..." : "Save sample order"}{" "}
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </main>
          ) : ["login", "register"].includes(route) ? (
  <main className="mx-auto w-full max-w-[1500px] px-4 py-10 sm:px-8 sm:py-14 lg:px-16 lg:py-20">
    <div className="mx-auto grid max-w-[1050px] overflow-hidden border border-[#26231f]/10 bg-white lg:grid-cols-[0.9fr_1.1fr]">

      {/* LEFT BRAND PANEL */}
      <div className="flex min-h-[260px] flex-col justify-between bg-[#f4f0e9] p-7 sm:p-10 lg:min-h-[620px] lg:p-12">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b0090]">
            My Liyas
          </span>

          <h1 className="mt-4 max-w-[430px] font-serif text-[38px] leading-[1.02] tracking-[-0.03em] text-[#26231f] sm:text-[48px] lg:text-[58px]">
            {route === "login"
              ? "Welcome back home."
              : "Create your Liyas account."}
          </h1>

          <p className="mt-5 max-w-[390px] text-[14px] leading-7 text-[#756d63]">
            Save favourites, keep your cart, place sample orders and follow your order status.
          </p>
        </div>

        <div className="mt-10 border-t border-[#26231f]/10 pt-5 text-[12px] leading-6 text-[#81786e]">
          Furniture • Electronics • Home
        </div>
      </div>

      {/* AUTH FORM */}
      <div className="p-6 sm:p-10 lg:p-12">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9b0090]">
          {route === "login" ? "Sign in" : "Sign up"}
        </span>

        <h2 className="mt-2 font-serif text-[34px] tracking-[-0.02em] text-[#26231f] sm:text-[40px]">
          {route === "login"
            ? "Access your account"
            : "Join Liyas"}
        </h2>

        <form
          className="mt-8 space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);

            const form = e.currentTarget;
            const values = Object.fromEntries(new FormData(form));

            try {
              const endpoint =
                route === "login"
                  ? "/api/auth/login"
                  : "/api/auth/register";

              const r = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
              });

              const d = await r.json();

              if (!r.ok) {
                throw Error(d.error || "Authentication failed.");
              }

              toast.success(
                route === "login"
                  ? "Welcome back"
                  : "Your account has been created",
              );

              window.location.href = "/account";
            } catch (e: any) {
              toast.error(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {route === "register" && (
            <label className="block">
              <span className="mb-2 block text-[12px] font-medium text-[#4e4841]">
                Full name
              </span>

              <input
                name="name"
                type="text"
                autoComplete="name"
                minLength={2}
                maxLength={100}
                required
                placeholder="Your name"
                className="h-12 w-full border border-[#26231f]/15 bg-white px-4 text-[14px] outline-none transition focus:border-[#9b0090]"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-2 block text-[12px] font-medium text-[#4e4841]">
              Email address
            </span>

            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className="h-12 w-full border border-[#26231f]/15 bg-white px-4 text-[14px] outline-none transition focus:border-[#9b0090]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[12px] font-medium text-[#4e4841]">
              Password
            </span>

            <input
              name="password"
              type="password"
              autoComplete={
                route === "login"
                  ? "current-password"
                  : "new-password"
              }
              minLength={route === "register" ? 8 : 1}
              maxLength={72}
              required
              placeholder={
                route === "register"
                  ? "At least 8 characters"
                  : "Your password"
              }
              className="h-12 w-full border border-[#26231f]/15 bg-white px-4 text-[14px] outline-none transition focus:border-[#9b0090]"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-3 bg-[#9b0090] px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#720069] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy
              ? route === "login"
                ? "Signing in..."
                : "Creating account..."
              : route === "login"
                ? "Sign in"
                : "Create account"}

            {!busy && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-7 border-t border-[#26231f]/10 pt-6 text-center">
          {route === "login" ? (
            <p className="text-[13px] text-[#756d63]">
              New to Liyas?{" "}
              <a
                href="/register"
                className="font-semibold text-[#9b0090] hover:underline"
              >
                Create an account
              </a>
            </p>
          ) : (
            <p className="text-[13px] text-[#756d63]">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold text-[#9b0090] hover:underline"
              >
                Sign in
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  </main>

          ) : route === "account" ? (
         <main className="mx-auto w-full max-w-[1500px] px-4 py-10 sm:px-8 sm:py-14 lg:px-16 lg:py-20">

  {/* PAGE HEADING */}
  <div className="mb-10 sm:mb-14">
    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b0090]">
      My Liyas
    </span>

    <h1 className="mt-3 font-serif text-[40px] leading-none tracking-[-0.03em] text-[#26231f] sm:text-[52px] lg:text-[64px]">
      Your account
    </h1>

    {user && (
      <p className="mt-4 text-[15px] text-[#756d63]">
        Welcome back,{" "}
        <span className="font-medium text-[#26231f]">
          {user.name}
        </span>
      </p>
    )}
  </div>

  {loading ? (

    /* LOADING */
    <div className="flex min-h-[350px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#9b0090]/20 border-t-[#9b0090]" />

        <p className="mt-4 text-[14px] text-[#756d63]">
          Loading your account…
        </p>
      </div>
    </div>

  ) : !user ? (

    /* NOT SIGNED IN */
    <div className="mx-auto flex min-h-[420px] max-w-[650px] flex-col items-center justify-center border border-[#26231f]/10 bg-[#faf9f7] px-6 py-16 text-center">

      <div className="grid h-16 w-16 place-items-center rounded-full bg-[#dda9da]/25 text-[#9b0090]">
        <User size={28} />
      </div>

      <span className="mt-7 text-[11px] font-bold uppercase tracking-[0.16em] text-[#9b0090]">
        Your account
      </span>

      <h2 className="mt-3 font-serif text-[34px] tracking-[-0.03em] text-[#26231f] sm:text-[42px]">
        Sign in to continue.
      </h2>

      <p className="mt-4 max-w-[430px] text-[14px] leading-7 text-[#756d63]">
        View your orders, saved favourites and manage your Liyas account
        from one place.
      </p>

      <a
        href="/login"
        className="
          mt-8
          inline-flex
          items-center
          justify-center
          gap-3
          bg-[#9b0090]
          px-8
          py-4
          text-[12px]
          font-semibold
          uppercase
          tracking-[0.12em]
          text-white
          transition
          duration-300
          hover:bg-[#720069]
        "
      >
        Sign in
        <ArrowRight size={16} />
      </a>
    </div>

  ) : (

    <Tabs defaultValue="orders" className="w-full">

      {/* TABS */}
      <TabsList
        className="
          mb-8
          grid
          h-auto
          w-full
          grid-cols-2
          rounded-none
          border-b
          border-[#26231f]/10
          bg-transparent
          p-0
          sm:mb-10
          sm:flex
          sm:w-fit
        "
      >
        <TabsTrigger
          value="orders"
          className="
            rounded-none
            border-b-2
            border-transparent
            bg-transparent
            px-5
            py-4
            text-[12px]
            font-semibold
            uppercase
            tracking-[0.1em]
            text-[#766e65]
            shadow-none
            data-[state=active]:border-[#9b0090]
            data-[state=active]:bg-transparent
            data-[state=active]:text-[#9b0090]
            data-[state=active]:shadow-none
          "
        >
          My orders
        </TabsTrigger>

        <TabsTrigger
          value="profile"
          className="
            rounded-none
            border-b-2
            border-transparent
            bg-transparent
            px-5
            py-4
            text-[12px]
            font-semibold
            uppercase
            tracking-[0.1em]
            text-[#766e65]
            shadow-none
            data-[state=active]:border-[#9b0090]
            data-[state=active]:bg-transparent
            data-[state=active]:text-[#9b0090]
            data-[state=active]:shadow-none
          "
        >
          Profile
        </TabsTrigger>
      </TabsList>

      {/* ORDERS TAB */}
      <TabsContent value="orders" className="mt-0">
        {orders.length ? (
          <div className="space-y-4">

            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9b0090]">
                  Purchase history
                </span>

                <h2 className="mt-2 font-serif text-[30px] text-[#26231f] sm:text-[36px]">
                  Your orders
                </h2>
              </div>

              <span className="text-[13px] text-[#7a7167]">
                {orders.length}{" "}
                {orders.length === 1 ? "order" : "orders"}
              </span>
            </div>

            {orders.map((o) => (
              <div
                key={o.id}
                className="
                  border
                  border-[#26231f]/10
                  bg-white
                  p-5
                  transition
                  hover:border-[#9b0090]/25
                  sm:p-6
                  lg:p-7
                "
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

                  {/* ORDER INFO */}
                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#9b0090]">
                        Order
                      </span>

                      <span className="text-[12px] text-[#81786d]">
                        {new Date(o.created).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="mt-2 break-all text-[16px] font-semibold text-[#26231f]">
                      {o.id}
                    </h3>

                    {/* ITEMS */}
                    <div className="mt-4">
                      <span className="text-[11px] uppercase tracking-[0.1em] text-[#958c81]">
                        Items
                      </span>

                      <p className="mt-1 max-w-[700px] text-[14px] leading-6 text-[#6d655b]">
                        {o.items
                          .map(
                            (i: any) =>
                              i.name + " × " + i.qty,
                          )
                          .join(", ")}
                      </p>
                    </div>
                  </div>

                  {/* ORDER PRICE */}
                  <div className="shrink-0 sm:text-right">
                    <span className="text-[11px] uppercase tracking-[0.1em] text-[#958c81]">
                      Total
                    </span>

                    <div className="mt-1 font-serif text-[26px] text-[#26231f]">
                      {money(o.total)}
                    </div>
                  </div>
                </div>

                {/* STATUS */}
                <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-[#26231f]/10 pt-5">

                  <span className="rounded-full bg-[#dda9da]/20 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9b0090]">
                    {o.status}
                  </span>

                  <span className="rounded-full bg-[#f3f0eb] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#71695f]">
                    {o.paymentStatus}
                  </span>

                  <span className="ml-auto hidden text-[12px] text-[#92897e] sm:block">
                    Sample order
                  </span>
                </div>
              </div>
            ))}
          </div>

        ) : (

          /* NO ORDERS */
          <div className="mx-auto flex min-h-[400px] max-w-[650px] flex-col items-center justify-center bg-[#faf9f7] px-6 py-14 text-center">

            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#dda9da]/25 text-[#9b0090]">
              <ShoppingBag size={27} />
            </div>

            <span className="mt-6 text-[11px] font-bold uppercase tracking-[0.15em] text-[#9b0090]">
              No orders yet
            </span>

            <h2 className="mt-3 font-serif text-[34px] tracking-[-0.03em] text-[#26231f] sm:text-[40px]">
              Your story starts here.
            </h2>

            <p className="mt-3 max-w-[430px] text-[14px] leading-7 text-[#766e65]">
              Explore furniture, electronics and home essentials
              for your next home upgrade.
            </p>

            <a
              href="/products"
              className="
                mt-7
                inline-flex
                items-center
                gap-3
                bg-[#9b0090]
                px-7
                py-4
                text-[12px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-white
                transition
                hover:bg-[#720069]
              "
            >
              Explore the collection
              <ArrowRight size={16} />
            </a>
          </div>
        )}
      </TabsContent>

      {/* PROFILE TAB */}
      <TabsContent value="profile" className="mt-0">

        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-12">

          {/* PROFILE DETAILS */}
          <div className="border border-[#26231f]/10 bg-white p-6 sm:p-8">

            <div className="flex items-center gap-4 border-b border-[#26231f]/10 pb-6">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#dda9da]/20 text-[#9b0090]">
                <User size={23} />
              </div>

              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9b0090]">
                  Profile
                </span>

                <h2 className="mt-1 truncate font-serif text-[28px] text-[#26231f] sm:text-[32px]">
                  {user.name}
                </h2>
              </div>
            </div>

            <div className="mt-7 space-y-6">

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#958c81]">
                  Name
                </span>

                <p className="mt-1 text-[15px] text-[#26231f]">
                  {user.name}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#958c81]">
                  Email address
                </span>

                <p className="mt-1 break-all text-[15px] text-[#26231f]">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="bg-[#f4f0e9] p-6 sm:p-7">

            <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#9b0090]">
              Quick links
            </span>

            <h3 className="mt-2 font-serif text-[28px] text-[#26231f]">
              Your Liyas
            </h3>

            <div className="mt-6 divide-y divide-[#26231f]/10">

              <a
                href="/wishlist"
                className="group flex items-center justify-between gap-4 py-4 text-[14px] text-[#26231f]"
              >
                <span className="flex items-center gap-3">
                  <Heart size={17} className="text-[#9b0090]" />
                  View wishlist
                </span>

                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>

              <a
                href="/"
                target="_top"
                className="group flex items-center justify-between gap-4 py-4 text-[14px] text-[#26231f]"
              >
                <span className="flex items-center gap-3">
                  <ShoppingBag
                    size={17}
                    className="text-[#9b0090]"
                  />
                  Back to shop
                </span>

                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
              <button
  type="button"
  onClick={async () => {
    try {
      const r = await fetch("/api/auth/logout", {
        method: "POST",
      });

      const data = await r.json();

      if (!r.ok) {
        throw new Error(data.error || "Unable to sign out.");
      }

      toast.success("Signed out successfully");

      window.location.href = "/";
    } catch (e: any) {
      toast.error(e.message || "Unable to sign out.");
    }
  }}
  className="
    group
    flex
    w-full
    items-center
    justify-between
    gap-4
    py-4
    text-left
    text-[14px]
    text-red-600
    transition
    hover:text-red-700
  "
>
  <span className="flex items-center gap-3">
    <LogOut size={17} />
    Sign out
  </span>

  <ArrowRight
    size={15}
    className="transition-transform group-hover:translate-x-1"
  />
</button>

              {user.admin && (
                <a
                  href="/admin"
                  className="group flex items-center justify-between gap-4 py-4 text-[14px] text-[#26231f]"
                >
                  <span className="flex items-center gap-3">
                    <ShieldCheck
                      size={17}
                      className="text-[#9b0090]"
                    />
                    Store management
                  </span>

                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>
              )}
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )}
</main>
          ) : route === "contact" ? (
           <main>
  <div className="collection-heading">
    <span className="font-serif text-[44px] text-[#9b0090] max-sm:text-[34px]">
      A friendly face. Just around the corner.
    </span>

    <br />

    <span className="text-[12px] font-bold tracking-[0.09em] text-[#dda9da]">
      LET’S TALK ABOUT YOUR HOME
    </span>
  </div>

  <div className="contact-layout">
    <div>
      <h2>Visit our showroom</h2>

      <p>{address}</p>

      <p>
        Visit the store to confirm opening hours, delivery options
        and product availability.
      </p>

      <a
        className="btn"
        href={maps}
        target="_blank"
        rel="noreferrer"
      >
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

  <div className="mt-7">
  <span className="mb-3 block text-[12px] font-bold uppercase tracking-[0.12em] text-[#9b0090]">
    Follow us
  </span>

  <div className="flex items-center gap-3">
    <Link
      href="https://www.instagram.com/liyasfurnitureandelectronics/?hl=en"
      target="_blank"
      rel="noreferrer"
      aria-label="Instagram"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-[#9b0090]/20 text-[#9b0090] transition-all duration-300"
    >
      <FaInstagram size={20} />
    </Link>

    <Link
      href="https://www.instagram.com/liyasfurnitureandelectronics/?hl=en"
      target="_blank"
      rel="noreferrer"
      aria-label="Facebook"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-[#9b0090]/20 text-[#9b0090] transition-all duration-300"
    >
      <FaFacebookF size={18}  />
    </Link>

  

    <Link
      href="https://wa.me/918867844051"
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-[#9b0090]/20 text-[#9b0090] transition-all duration-300"
    >
      <FaWhatsapp size={20} />
    </Link>

    <Link
      href="tel:+918867844051"
      aria-label="Call us"
      className="flex h-11 w-11 items-center justify-center rounded-full bg-white border border-[#9b0090]/20 text-[#9b0090] transition-all duration-300"
    >
      <Phone size={19} />
    </Link>
  </div>
</div>


    </div>

    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);

        const form = e.currentTarget;

        try {
          await api(
            "contact",
            Object.fromEntries(new FormData(form)),
          );

          toast.success("Your enquiry has been saved.");
          form.reset();

        } catch (e: any) {
          toast.error(e.message);

        } finally {
          setBusy(false);
        }
      }}
    >
      <span className="font-serif text-[32px] text-[#9b0090]">
        How can we help?
      </span>

      <div className="form-grid">
        {field("name", "Your name")}
        {field("phone", "Phone", "tel")}
        {field("email", "Email", "email")}
        {field("subject", "Subject")}
      </div>

      <label className="field">
        Message

        <textarea
          name="message"
          minLength={5}
          maxLength={3000}
          required
          rows={5}
        />
      </label>

      <button className="btn" disabled={busy}>
        {busy ? "Saving..." : "Send enquiry"}
        <ArrowRight size={16} />
      </button>

      {!user && (
        <p className="sample-note">
          <a href="/login">Sign in</a> to save your enquiry.
        </p>
      )}
    </form>

     
    
  </div>
       <div className="mx-auto max-w-[180vh] px-4 pt-0 max-sm:pt-12 sm:px-6 lg:px-8">

  {/* TRUSTED BY */}
  <div className="mb-10 flex items-center justify-center">
    <div className="h-[2px] flex-1 bg-slate-200" />

    <span className="whitespace-nowrap px-4 text-[10px] font-light uppercase tracking-widest text-black sm:text-[13px]">
      Our partner brands
    </span>

    <div className="h-[2px] flex-1 bg-slate-200" />
  </div>

  {/* INFINITE LOGO MARQUEE */}
  <div className="relative mb-5 w-full overflow-hidden">

    <style
      dangerouslySetInnerHTML={{
        __html: `
          @keyframes logoMarquee {
            from {
              transform: translate3d(0, 0, 0);
            }

            to {
              transform: translate3d(-50%, 0, 0);
            }
          }

          .logo-marquee-track {
            display: flex;
            width: max-content;
            animation: logoMarquee 20s linear infinite;
            will-change: transform;
          }
        `,
      }}
    />

    <div className="logo-marquee-track py-4 opacity-85">

      {/* ORIGINAL */}
      <LogoSet />

      {/* EXACT DUPLICATE FOR SEAMLESS LOOP */}
      <div aria-hidden="true">
        <LogoSet />
      </div>

    </div>
  </div>
</div>
</main>
          ) : route === "about" ? (
           <main className="bg-white text-[#26231f]">

  {/* HERO */}
  <section className="mx-auto grid max-w-[1500px] gap-8 px-4 py-10 sm:gap-10 sm:px-8 sm:py-14 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-16 lg:py-24">

    <div className="max-w-[620px]">
      <span className="mb-5 block text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9b0090]">
        Rooted in Thirthahalli
      </span>

      <h1 className="text-[40px] font-medium tracking-[-0.025em] sm:text-[52px] md:text-[60px] lg:text-[62px]">
        Good things.
        <br />
        For the place
        <br />
        you call home.
      </h1>

      <p className="mt-6 max-w-[560px] text-[15px] leading-7 text-[#625b52] sm:mt-8 sm:text-[16px] sm:leading-8 md:text-[17px]">
        Liyas Electronics & Furniture brings electronics, home appliances
        and furniture together in one neighbourhood showroom. From everyday
        essentials to a fresh start for your living room, explore practical
        choices with friendly local support.
      </p>

    

      <div className="mt-6 flex flex-wrap gap-2 sm:mt-9">
          <p className="mt-3 max-w-[560px] text-[15px] leading-7 text-[#625b52] sm:mt-4 sm:text-[16px] sm:leading-8">
        Visit us in Seebinakere, on Sagara Road, and find the right fit for
        your home.
      </p>
       
      </div>
    </div>

    <div className="relative">
      <div className=" overflow-hidden rounded-[2px] ">
        <img
          src="/images/liyas.jpg"
          alt="Inviting furnished home"
          className="h-[300px] w-full object-cover sm:h-[420px] md:h-[500px] lg:h-full "
        />
      </div>

      <div className="absolute bottom-3 left-3 bg-[#dda9da] px-3 py-2 shadow-sm sm:bottom-5 sm:left-5 sm:px-5 sm:py-4">
        <span className="block text-[10px] uppercase tracking-[0.25em] text-black">
          Furniture • Electronics • Home
        </span>
      </div>
    </div>

  </section>


  {/* INTRO STATEMENT */}
  <section className="border-y border-[#26231f]/10">
    <div className="mx-auto max-w-[1500px] px-4 py-12 sm:px-8 sm:py-14 md:px-10 lg:px-16 lg:py-16 ">

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[0.6fr_1.4fr] lg:gap-10">

        <div>
          <span className="text-[40px] font-semibold uppercase tracking-[0.08em] text-[#9b0090] sm:text-[56px] md:text-[80px] lg:text-[131px] lg:tracking-[0.1em]">
            Who we are
          </span>
        </div>

        <div className="flex flex-col justify-center gap-6">
          <span className="max-w-[900px] font-serif text-[29px] leading-[1.10] tracking-[-0.01em] sm:text-[38px] md:text-[46px] lg:text-[56px]">
            A neighbourhood store built around real homes and everyday living.
          </span>

          <p className="mt-3 max-w-[750px] text-[16px] leading-7 text-[#696157] sm:mt-5 sm:text-[18px] sm:leading-8 md:text-[21px] lg:mt-8 lg:text-[26px] lg:leading-4">
            We believe choosing something for your home should feel simple.
            Whether it is a sofa, television, refrigerator or dining table,
            our goal is to help you find products that fit your space,
            lifestyle and budget.
          </p>
        </div>

      </div>
    </div>
  </section>


  {/* VALUES */}
  <section className="mx-auto max-w-[1500px] px-4 py-12 sm:px-8 sm:py-14 md:px-10 lg:px-16 lg:py-24">

    <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <span className="text-[26px] font-semibold uppercase tracking-[0.1em] text-[#9b0090] sm:text-[32px] md:text-[38px]">
          What matters to us
        </span>

        <h2 className="mt-3 text-[32px] tracking-[-0.035em] italic sm:mt-4 sm:text-[44px] md:text-[54px]">
          Simple values. Better choices.
        </h2>
      </div>
    </div>

    <div className="grid border-t border-[#26231f]/15 md:grid-cols-3">

      <div className="border-b border-[#26231f]/15 py-10 md:border-b-0 md:border-r md:pr-10">
        <span className="text-[42px] text-[#dda9da]">01</span>

        <h3 className="mt-7 text-[26px]">
          Practical choices
        </h3>

        <p className="mt-4 max-w-[350px] text-[15px] leading-7 text-[#6c645a]">
          Products selected for everyday use, comfort and long-term value.
        </p>
      </div>


      <div className="border-b border-[#26231f]/15 py-10 md:border-b-0 md:border-r md:px-10">
        <span className="text-[42px] text-[#dda9da]">02</span>

        <h3 className="mt-7 text-[26px]">
          Local support
        </h3>

        <p className="mt-4 max-w-[350px] text-[15px] leading-7 text-[#6c645a]">
          Friendly assistance from people who understand the homes and
          families around Thirthahalli.
        </p>
      </div>


      <div className="py-10 md:pl-10">
        <span className="text-[42px] text-[#dda9da]">03</span>

        <h3 className="mt-7 text-[26px]">
          Everything together
        </h3>

        <p className="mt-4 max-w-[350px] text-[15px] leading-7 text-[#6c645a]">
          Furniture, appliances and electronics under one roof for a simpler
          shopping experience.
        </p>
      </div>

    </div>
  </section>


  {/* CATEGORY IMAGE SECTION */}
  <section className=" text-[#f5f0e7]">

    <div className="mx-auto grid max-w-[1500px] lg:grid-cols-2">

      <a
        href="/furniture"
        className="group relative min-h-[340px] overflow-hidden sm:min-h-[420px] lg:min-h-[520px]"
      >
        <img
          src="/images/2.png"
          alt="Furniture collection"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-8 lg:p-12">
          <div>
            <span className="text-[13px] uppercase tracking-[0.2em] text-white sm:text-[16px] lg:text-[20px]">
              Spaces to live in
            </span>

            <h3 className="mt-2 text-[32px] tracking-[-0.03em] sm:text-[36px] lg:mt-3 lg:text-[42px]">
              Furniture
            </h3>
          </div>

          <span className="grid size-12 place-items-center rounded-full border border-white/50">
            <ArrowRight size={18} />
          </span>
        </div>
      </a>


      <a
        href="/electronics"
        className="group relative min-h-[340px] overflow-hidden sm:min-h-[420px] lg:min-h-[520px]"
      >
        <img
          src="/images/kitchen.jpg"
          alt="Electronics collection"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-8 lg:p-12">
          <div>
            <span className="text-[13px] uppercase tracking-[0.2em] text-white sm:text-[16px] lg:text-[20px]">
              Made for everyday life
            </span>

            <h3 className="mt-2 text-[32px] tracking-[-0.03em] sm:text-[36px] lg:mt-3 lg:text-[42px]">
              Electronics
            </h3>
          </div>

          <span className="grid size-12 place-items-center rounded-full border border-white/50">
            <ArrowRight size={18} />
          </span>
        </div>
      </a>

    </div>
  </section>


  {/* LOCAL STORE SECTION */}
  <section className="mx-auto grid max-w-[1500px] gap-9 px-4 py-14 sm:px-8 sm:py-16 md:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:px-16 lg:py-28">

    <div className="relative">
      <img
        src="/images/showroom.png"
        alt="Liyas showroom"
        className="h-[300px] w-full object-cover sm:h-[420px] md:h-[480px] lg:h-[530px]"
      />

      <div className="absolute bottom-3 right-3 bg-[#dda9da] px-3 py-2 sm:bottom-5 sm:right-5 sm:px-5 sm:py-4">
        <span className="text-[10px] uppercase tracking-[0.25em] text-black">
          Seebinakere • Thirthahalli
        </span>
      </div>
    </div>


    <div className="lg:pl-12">
      <span className="text-[15px] font-semibold uppercase tracking-[0.3em] text-[#9b0090]">
        A local store
      </span>
<br/>
      <span className="mt-4 block font-serif text-[38px] leading-[1.05] tracking-[-0.04em] sm:text-[50px] md:text-[58px] lg:mt-5 lg:text-[66px]">
        See it.
        <br />
        Feel it.
        <br />
        Take it home.
      </span>

      <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-[#696157] sm:mt-7 sm:text-[16px] sm:leading-8">
        Shopping for your home is easier when you can experience products in
        person. Visit our showroom, compare options and get help choosing what
        works best for your space.
      </p>

      <a
        href="/contact"
        className="mt-8 inline-flex items-center gap-3 border-b border-[#26231f] pb-1 text-[14px] font-medium"
      >
        Find our showroom
        <ArrowRight size={16} />
      </a>
    </div>

  </section>


  {/* BIG STATEMENT */}
  <section className="border-y border-[#26231f]/10">
    <div className="mx-auto max-w-[1500px] px-4 py-14 text-center sm:px-8 sm:py-16 md:px-10 lg:px-16 lg:py-10">

      <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#9b0090]">
        Liyas Electronics & Furniture
      </span>

      <h2 className="mx-auto mt-6 max-w-[1050px] text-[34px] leading-[1.05] tracking-[-0.045em] sm:text-[48px] md:text-[60px] lg:mt-7 lg:text-[76px]">
        Helping make everyday homes feel a little more complete.
      </h2>

    </div>
  </section>


  {/* CTA */}
  <section className="w-full px-4 py-12 sm:px-8 sm:py-14 md:px-10 lg:px-16 lg:py-24">

    <div className="flex flex-col justify-between gap-7 bg-[#dda9da] px-5 py-8 sm:gap-9 sm:px-10 sm:py-10 md:px-12 lg:flex-row lg:items-center lg:gap-10 lg:px-16">

      <div className="leading-[1.05]">
        <span className="text-[23px] font-bold uppercase tracking-[0.1em] text-[#9b0090] sm:text-[27px] lg:text-[32px]">
          Come say hello
        </span>
        <br/>

        <span className="font-serif text-[31px] text-white tracking-[-0.04em] sm:text-[40px] md:text-[46px] lg:text-[50px]">
          Visit Liya’s in Thirthahalli.
        </span>
        <br/>

        {/* <span className="mt-4 max-w-[600px] text-[15px] leading-7 text-[#625b52]">
          Explore furniture, electronics and home appliances in one place.
        </span> */}
      </div>

      <a
        href="/contact"
        className="inline-flex w-full shrink-0 items-center justify-center gap-3 bg-[#dda9da] px-7 py-4 text-[13px] font-medium uppercase tracking-[0.12em] text-white transition duration-300 hover:bg-black/2 sm:w-fit"
      >
        Get directions
        <ArrowRight size={16} />
      </a>

    </div>
  </section>

</main>
          ) : route === "admin" ? (
            <main className="mx-auto w-full max-w-[1500px] px-4 py-10 sm:px-8 sm:py-14 lg:px-16 lg:py-20">
              <div className="mb-10 sm:mb-14">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b0090]">
                  Liyas Admin
                </span>
                <h1 className="mt-3 font-serif text-[40px] leading-none tracking-[-0.03em] text-[#26231f] sm:text-[52px] lg:text-[64px]">
                  Store management
                </h1>
                <p className="mt-4 max-w-[620px] text-[14px] leading-7 text-[#756d63]">
                  Manage your products, orders, customers and store activity from one place.
                </p>
              </div>
              {!admin ? (
                <div className="flex min-h-[320px] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#9b0090]/20 border-t-[#9b0090]" />
                    <p className="mt-4 text-[14px] text-[#756d63]">Loading store management…</p>
                  </div>
                </div>
              ) : admin.error ? (
                <div className="mx-auto flex min-h-[420px] max-w-[650px] flex-col items-center justify-center border border-[#26231f]/10 bg-[#faf9f7] px-6 py-16 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-[#dda9da]/25 text-[#9b0090]"><ShieldCheck size={28} /></div>
                  <h2 className="mt-6 font-serif text-[34px] text-[#26231f] sm:text-[42px]">Administrator access required</h2>
                  <p>{admin.error}</p>
                  <a href="/account" className="btn">
                    My account
                  </a>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    <div className="border border-[#26231f]/10 bg-white p-5 sm:p-6">
                      <small className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#958c81]">Products</small>
                      <h2 className="mt-2 font-serif text-[34px] text-[#26231f] sm:text-[40px]">{admin.products.length}</h2>
                    </div>
                    <div className="border border-[#26231f]/10 bg-white p-5 sm:p-6">
                      <small className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#958c81]">Orders</small>
                      <h2 className="mt-2 font-serif text-[34px] text-[#26231f] sm:text-[40px]">{admin.orders.length}</h2>
                    </div>
                    <div className="border border-[#26231f]/10 bg-white p-5 sm:p-6">
                      <small className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#958c81]">Pending</small>
                      <h2>
                        {
                          admin.orders.filter(
                            (o: any) => o.status === "Pending",
                          ).length
                        }
                      </h2>
                    </div>
                    <div className="border border-[#26231f]/10 bg-[#f4f0e9] p-5 sm:p-6">
                      <small className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#958c81]">Sample order value</small>
                      <h2>
                        {money(
                          admin.orders.reduce(
                            (s: number, o: any) => s + o.total,
                            0,
                          ),
                        )}
                      </h2>
                    </div>
                  </div>
                  <Tabs defaultValue={path[1] || "products"} className="mt-10 w-full sm:mt-12">
                    <TabsList className="mb-7 flex h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b border-[#26231f]/10 bg-transparent p-0">
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
                        <TabsTrigger
                          value={v}
                          key={v}
                          className="shrink-0 rounded-none border-b-2 border-transparent bg-transparent px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#766e65] shadow-none data-[state=active]:border-[#9b0090] data-[state=active]:bg-transparent data-[state=active]:text-[#9b0090] data-[state=active]:shadow-none"
                        >
                          {v}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {[
                      "products",
                      "categories",
                      "brands",
                      "offers",
                      "reviews",
                    ].map((v) => (
                      <TabsContent key={v} value={v}>
                        <button
                          className="mb-6 inline-flex w-full items-center justify-center gap-2 bg-[#9b0090] px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#720069] sm:w-auto"
                          onClick={() =>
                            setEdit({
                              kind:
                                v === "categories"
                                  ? "category"
                                  : v.slice(0, -1),
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
                          Add {v === "categories" ? "category" : v.slice(0, -1)}{" "}
                          <Plus size={16} />
                        </button>
                        {admin[v].map((p: any) => (
                       <div
  className="flex flex-col gap-4 border border-[#26231f]/10 bg-white p-5 transition hover:border-[#9b0090]/25 sm:flex-row sm:items-center sm:justify-between sm:p-6"
  key={p.id}
>
  <div className="min-w-0">
    <b>{p.name || p.title || p.id}</b>

    <p>
      {p.price !== undefined
        ? money(p.price) + " · Stock: " + p.stock
        : p.description}
    </p>
  </div>

  <div className="flex w-full gap-2 sm:w-auto">
    <button
      type="button"
      className="inline-flex flex-1 items-center justify-center border border-[#26231f]/15 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#26231f] transition hover:border-[#9b0090] hover:text-[#9b0090] sm:flex-none"
      onClick={() =>
        setEdit({
          kind:
            v === "categories"
              ? "category"
              : v.slice(0, -1),
          id: p.id,
          data: p,
        })
      }
    >
      Edit
    </button>

    <button
      type="button"
       className="inline-flex flex-1 items-center justify-center border border-[#26231f]/15 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#26231f] transition hover:border-[#9b0090] hover:text-[#9b0090] sm:flex-none"
      onClick={async () => {
        const confirmed = window.confirm(
          `Delete "${p.name || p.title || p.id}"?`,
        );

        if (!confirmed) return;

        try {
          const kind =
            v === "categories"
              ? "category"
              : v.slice(0, -1);

          await api(
            "admin-delete",
            {},
            {
              kind,
              id: p.id,
            },
          );

          toast.success("Deleted successfully");

          setAdmin(
            await (
              await fetch("/api/shop?type=admin")
            ).json(),
          );

          load();
        } catch (e: any) {
          toast.error(
            e.message || "Unable to delete item",
          );
        }
      }}
    >
      
      Delete
    </button>
  </div>
</div>
                        ))}
                      </TabsContent>
                    ))}
                    <TabsContent value="orders">
                      {admin.orders.map((o: any) => (
                        <div className="flex flex-col gap-5 border border-[#26231f]/10 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6" key={o.id}>
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
                                await api(
                                  "admin",
                                  { status },
                                  { kind: "order", id: o.id },
                                );
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
                            <SelectTrigger className="w-full sm:w-[220px]">
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
                      {Array.from(
                        new Set(admin.orders.map((o: any) => o.email)),
                      ).map((email: any) => (
                        <div className="flex items-center justify-between gap-4 border border-[#26231f]/10 bg-white p-5" key={email}>
                          <b>{email}</b>
                          <span>
                            {
                              admin.orders.filter((o: any) => o.email === email)
                                .length
                            }{" "}
                            orders
                          </span>
                        </div>
                      ))}
                    </TabsContent>
                    <TabsContent value="enquiries">
                      {admin.enquiries.map((e: any) => (
                        <div className="border border-[#26231f]/10 bg-white p-5 sm:p-6" key={e.id}>
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
                <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-[620px] overflow-y-auto border-[#26231f]/10 bg-white p-5 sm:p-7">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-[30px] capitalize text-[#26231f]">Edit {edit?.kind}</DialogTitle>
                  </DialogHeader>
                  {edit && (
                    <form
                      className="mt-5 space-y-5"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          await api("admin", edit.data, {
                            kind: edit.kind,
                            id: edit.id,
                          });
                          toast.success("Saved");
                          setEdit(null);
                          setAdmin(
                            await (await fetch("/api/shop?type=admin")).json(),
                          );
                          load();
                        } catch (e: any) {
                          toast.error(e.message);
                        }
                      }}
                    >
                      {Object.entries(edit.data)
                        .filter(([k]) => !["id", "created"].includes(k))
                        .map(([k, v]) => (
                          <label className="field block" key={k}>
                            <span className="mb-2 block capitalize">{k}</span>

                            {k === "image" && edit.kind === "product" ? (
                              <div className="space-y-3">
                                {String(v || "") && (
                                  <div className="overflow-hidden border border-[#26231f]/10 bg-[#f7f5f2] p-3">
                                    <img
                                      src={String(v)}
                                      alt="Product preview"
                                      className="h-[190px] w-full object-contain"
                                    />
                                  </div>
                                )}

                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  disabled={uploadingImage}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadProductImage(file);
                                    e.currentTarget.value = "";
                                  }}
                                  className="block w-full cursor-pointer text-[13px] file:mr-4 file:border-0 file:bg-[#9b0090] file:px-4 file:py-2.5 file:text-[11px] file:font-semibold file:uppercase file:tracking-[0.08em] file:text-white hover:file:bg-[#720069] disabled:cursor-not-allowed disabled:opacity-60"
                                />

                                <small className="block text-[12px] leading-5 text-[#756d63]">
                                  {uploadingImage
                                    ? "Uploading image…"
                                    : "Choose JPG, PNG, WEBP or GIF from your computer. Maximum 5 MB."}
                                </small>
                              </div>
                            ) : typeof v === "boolean" ? (
                              <Checkbox
                                checked={v}
                                onCheckedChange={(value) =>
                                  setEdit({
                                    ...edit,
                                    data: { ...edit.data, [k]: !!value },
                                  })
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

                      <button
                        disabled={
                          uploadingImage ||
                          (edit.kind === "product" && !edit.data.image)
                        }
                        className="mt-2 inline-flex w-full items-center justify-center bg-[#9b0090] px-6 py-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#720069] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {uploadingImage ? "Uploading image…" : "Save changes"}
                      </button>
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
    <footer className="relative overflow-hidden bg-[#26231f] text-[#f4efe5]">

  <div className="relative z-10 mx-auto max-w-[1500px] px-4 py-0 sm:px-8 md:px-10 lg:px-10 lg:py-16">

    {/* TOP */}
    <div className="grid gap-12 border-b border-white/10 pb-10 md:grid-cols-2 lg:grid-cols-[1.5fr_0.7fr_0.8fr_1fr] lg:gap-16">

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
            className="h-[70px] w-auto object-contain sm:h-[105px] my-4 md:my-0 md:mb-2"
          />
        </a>

        <p className="mt-5 max-w-[380px] text-[15px] leading-7 text-white/60">
          Thoughtful choices for better living.
          <br />
          Your neighbourhood home store in Thirthahalli.
        </p>

        <div className="mt-7 flex items-center gap-3">
          <span className="h-px w-10 bg-[#9b0090] hidden md:block" />

          <span className="text-[10px] uppercase tracking-[0.28em] text-[#9b0090]">
            Furniture • Electronics • Home
          </span>
        </div>
      </div>


      {/* EXPLORE */}
      <div>
        <h4 className="mb-6 text-[14px] font-bold uppercase tracking-[0.10em] text-[#9b0090]">
          Explore
        </h4>

        <div className="flex flex-col gap-4">
          <a
            href="/electronics"
            className="w-fit text-[15px] text-white/70 transition-colors duration-200 hover:text-white"
          >
            Electronics
          </a>

          <a
            href="/furniture"
            className="w-fit text-[15px] text-white/70 transition-colors duration-200 hover:text-white"
          >
            Furniture
          </a>

          <a
            href="/offers"
            className="w-fit text-[15px] text-white/70 transition-colors duration-200 hover:text-white"
          >
            Offers
          </a>

          <a
            href="/products"
            className="w-fit text-[15px] text-white/70 transition-colors duration-200 hover:text-white"
          >
            All products
          </a>
        </div>
      </div>


      {/* HELP */}
      <div>
        <h4 className="mb-6 text-[14px] font-bold uppercase tracking-[0.10em] text-[#9b0090]">
          Here to help
        </h4>

        <div className="flex flex-col gap-4">
          <a
            href="/about"
            className="w-fit text-[15px] text-white/70 transition-colors duration-200 hover:text-white"
          >
            About Liya’s
          </a>

          <a
            href="/contact"
            className="w-fit text-[15px] text-white/70 transition-colors duration-200 hover:text-white"
          >
            Contact & location
          </a>

          <a
            href="/account"
            className="w-fit text-[15px] text-white/70 transition-colors duration-200 hover:text-white"
          >
            My account
          </a>

          <a
            href="/account"
            className="w-fit text-[15px] text-white/70 transition-colors duration-200 hover:text-white"
          >
            Track your orders
          </a>
        </div>
      </div>


      {/* LOCATION */}
      <div>
        <h4 className="mb-6 text-[14px] font-bold uppercase tracking-[0.10em] text-[#9b0090]">
          Come say hello
        </h4>

        <p className="max-w-[280px] text-[15px] leading-7 text-white/65">
          {address}
        </p>

        <a
          href={maps}
          target="_blank"
          rel="noreferrer"
          className="group mt-6 inline-flex items-center gap-3 border-b border-white/30 pb-1 text-[14px] text-white transition-colors hover:border-white"
        >
          Get directions

          <ArrowUpRight
            size={15}
            className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </a>
      </div>

    </div>


    {/* BOTTOM */}
    <div className="relative flex min-h-[110px] flex-row justify-start gap-3 pt-2 text-[12px] text-black sm:flex-row sm:items-end sm:justify-between">

      <div className="relative z-10 flex flex-col gap-0 ">
        <span>
          © {new Date().getFullYear()} Liya’s Electronics & Furniture
        </span>

        <span>
          Made for your home. Rooted in Thirthahalli.
        </span>
      </div>


      {/* LARGE LIYAS TEXT */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-52px] md:bottom-[-135px] right-0 select-none  text-[125px] font-extrabold leading-none tracking-[-0.01em] md:tracking-[-0.05em] text-[#dda9da]/30  md:text-[#dda9da]/60 sm:text-[110px] lg:text-[350px]"
      >
        LIYA<span className="font-light">'</span>S
      </div>

    </div>

  </div>

</footer>
        </div>
      </div>
      <a
        className="floating-help"
        href="/contact"
        aria-label="Contact the store"
      >
        <MessageCircle size={23} />
      </a>
    </>
  );
}
