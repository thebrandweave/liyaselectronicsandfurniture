"use client";
import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight,Heart } from "lucide-react";
// import { useState } from "react";
import { ArrowUpRight, Plus, MapPin, Truck, ShieldCheck, Headphones } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Product, money } from "@/lib/catalog";
import Image from "next/image";



const slides = [
  {
    id: "living",
    image: "/images/1.png",
    eyebrow: "THE LIYA’S LIVING COLLECTION",
    title: "Make yourself at home.",
    copy: "Sofas, chairs and the little things that make a space feel like yours.",
    link: "/products?category=Sofas",
    cta: "Explore living room",
  },
  {
    id: "dining",
    image: "/images/2.png",
    eyebrow: "THE LIYA’S DINING COLLECTION",
    title: "Room for every moment.",
    copy: "Bring everyone together, from quiet breakfasts to long conversations.",
    link: "/products?category=Dining%20Tables",
    cta: "Explore dining room",
  },
  {
    id: "bedroom",
    image: "/images/3.png",
    eyebrow: "THE LIYA’S BEDROOM COLLECTION",
    title: "Your everyday retreat.",
    copy: "A softer landing. A slower morning. Find comfort in your own space.",
    link: "/products?category=Beds",
    cta: "Explore bedroom",
  },
];
const rooms = [
  {
    name: "Living room",
    image: "/images/room-living.jpg",
    
    intro: "A place to unwind.",
    copy: "Find the right balance of comfort, character and everyday practicality.",
    ids: ["cloud-sofa", "accent-chair"],
    category: "Sofas",
  },
  {
    name: "Dining room",
    image: "/images/room-dining.jpg",
    intro: "Better, together.",
    copy: "Make space for shared meals, unexpected guests and another cup of tea.",
    ids: ["dining-table", "accent-chair"],
    category: "Dining Tables",
  },
  {
    name: "Bedroom",
    image: "/images/room-bedroom.jpg",
    intro: "Settle into your sanctuary.",
    copy: "Quiet shapes and comfortable essentials for the end of a long day.",
    ids: ["bed", "accent-chair"],
    category: "Beds",
  },
];
export default function ShowroomHome({

  
  products,
  renderProduct,
}: {
  products: Product[];
  renderProduct: (p: Product) => ReactNode;
}) {
  const [currentRoom, setCurrentRoom] = useState(0);
  const [api, setApi] = useState<CarouselApi>(),
    [slide, setSlide] = useState(0),
    [tab, setTab] = useState("All");
  useEffect(() => {
    if (!api) return;
    const onSelect = () => setSlide(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const prevRoom = () => {
    setCurrentRoom((prev) =>
      prev === 0 ? rooms.length - 1 : prev - 1
    );
  };

  const nextRoom = () => {
    setCurrentRoom((prev) =>
      prev === rooms.length - 1 ? 0 : prev + 1
    );
  };

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
  return (
    <div className="showroom-home w-full overflow-clip max-lg:[&_svg]:shrink-0">
      <Carousel
        className="showroom-hero"
        opts={{ loop: true, duration: 0 }}
        setApi={setApi}
        aria-label="Explore Liya’s room collections"
      >
        <CarouselContent className="hero-track">
          {slides.map((s, i) => (
            <CarouselItem
              className="hero-slide max-md:h-auto! max-md:min-h-[520px]!"
              key={s.id}
              aria-label={`${i + 1} of ${slides.length}: ${s.eyebrow}`}
              aria-hidden={slide !== i}
              inert={slide !== i}
            >
              <img
                className="showroom-hero-image"
                src={s.image}
                alt={`${s.id === "living" ? "Living room with a comfortable sofa" : s.id === "dining" ? "Dining room with a table and chairs" : "Comfortable contemporary bedroom"}`}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "auto"}
              />
              <div className="showroom-hero-shade" />
              <div className="showroom-hero-copy max-md:min-h-[520px] max-md:px-6! max-md:py-24! max-sm:[&>h1]:text-[42px]! max-sm:[&>h2]:text-[42px]! max-sm:[&>span]:leading-relaxed max-sm:[&>a]:max-w-full max-sm:[&>a]:gap-4!">
                <span>{s.eyebrow}</span>
                {i === 0 ? <h1>{s.title}</h1> : <h2>{s.title}</h2>}
                <p>{s.copy}</p>
                <a className="showroom-button light" href={s.link}>
                  {s.cta}
                  <ArrowUpRight size={18} />
                </a>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hero-prev" />
        <CarouselNext className="hero-next" />
        <div
          className="hero-pagination absolute bottom-[25px] left-1/2 z-[2] flex -translate-x-1/2 items-center gap-0 max-[761px]:bottom-[22px]"
          aria-label="Select a room"
        >
          {slides.map((s, i) => (
            <button
              key={s.id}
              aria-label={`Show ${s.id} collection`}
              aria-current={slide === i ? "true" : undefined}
              onClick={() =>
                api?.scrollTo(i, true)
              }
            >
              <span />
            </button>
          ))}
        </div>
        <div className="hero-location">
          <MapPin size={14} /> YOUR HOME STORE IN THIRTHAHALLI
        </div>
      </Carousel>
  <main className="showroom-main mx-auto! w-full! px-[1.3%]! max-[1024px]:px-[5%]!">
        <section className="popular-section">
          <div className="showroom-heading max-sm:flex-col! max-sm:items-start! max-sm:[&>a]:max-w-none! max-sm:[&>a]:min-h-11! mb-7 flex items-end justify-between gap-[25px] max-[761px]:mb-[23px] max-[761px]:items-start max-[761px]:gap-[15px] max-[371px]:flex-wrap">
            <h2>Popular categories</h2>
            <a href="/products">
              Shop all products <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="popular-grid max-sm:grid-cols-2! grid grid-cols-6 gap-[18px] max-[1201px]:gap-[15px] max-[1024px]:grid-cols-3 max-[1024px]:gap-x-5 max-[1024px]:gap-y-[25px] max-[761px]:gap-x-3 max-[761px]:gap-y-[22px] max-[371px]:gap-x-[9px] max-[371px]:gap-y-[19px]">
            {[
              { label: "Sofas", image: "sofa", category: "Sofas" },
               { label: "Appliances", image: "fridge", category: "Refrigerators" },
              { label: "Chairs", image: "chair", category: "Chairs" },
               
             
              { label: "Beds", image: "bed", category: "Beds" },
              { label: "Televisions", image: "tv", category: "Televisions" },
             { label: "Dining tables", image: "dining", category: "Dining Tables" },
            ].map((c) => (
              <a
                href={"/products?category=" + encodeURIComponent(c.category)}
                className="popular-item max-sm:[&>span]:min-h-11 max-sm:[&>span]:text-[13px]!"
                key={c.label}
              >
               <div className="">
        <img
          src={"/images/" + c.image + ".jpg"}
          alt={c.label}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
                <span>
                  {c.label}
                  <ArrowUpRight size={15} />
                </span>
              </a>
            ))}
          </div>
        </section>
    <section className="rooms-section">
  <div className="showroom-heading max-sm:flex-col! max-sm:items-start! max-sm:[&>a]:max-w-none! max-sm:[&>a]:min-h-11! mb-7 flex items-end justify-between gap-[25px] max-[761px]:mb-[23px] max-[761px]:items-start max-[761px]:gap-[15px] max-[371px]:flex-wrap">
    <div>
      <span className="tiny-label">A HOME, ONE ROOM AT A TIME</span>
      <h2>Find your kind of living.</h2>
    </div>

    <a href="/furniture">
      Discover furniture <ArrowUpRight size={18} />
    </a>
  </div>

<div className="relative grid grid-cols-[8.5fr_1fr] gap-2 max-[761px]:grid-cols-1 max-[761px]:[&>article:first-child>a]:h-[360px]! max-[400px]:[&>article:first-child>a]:h-[300px]!">

  {/* MAIN IMAGE - 8.5fr */}
  <article className={`room-collection room-${currentRoom}`}>
    <a
      className="room-collection-photo"
      href={
        "/products?category=" +
        encodeURIComponent(rooms[currentRoom].category)
      }
    >
      <img
        src={rooms[currentRoom].image}
        alt={`${rooms[currentRoom].name} interior inspiration`}
        loading="lazy"
      />

      <div className="room-photo-shade" />

      <div className="room-collection-name max-sm:left-5! max-sm:right-5! max-sm:[&>h3]:text-[34px]!">
        <span>
          0{currentRoom + 1} / THE LIYA’S COLLECTION
        </span>

        <h3>{rooms[currentRoom].name}</h3>
      </div>

      <span className="room-open absolute bottom-[22px] right-[22px] grid size-11 place-items-center rounded-full border border-white/70">
        <ArrowUpRight size={24} />
      </span>
    </a>
  </article>


  {/* NEXT IMAGE - 1fr */}
  <article className="room-collection max-[761px]:hidden">
    <a
      className="room-collection-photo"
      href={
        "/products?category=" +
        encodeURIComponent(
          rooms[(currentRoom + 1) % rooms.length].category
        )
      }
    >
      <img
        src={rooms[(currentRoom + 1) % rooms.length].image}
        alt={`${rooms[(currentRoom + 1) % rooms.length].name} interior inspiration`}
        loading="lazy"
      />

      <div className="room-photo-shade" />
    </a>
  </article>


  {/* LEFT BUTTON */}
  <button
    type="button"
    onClick={prevRoom}
    aria-label="Previous room"
    className="absolute left-4 top-[40%] z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg hover:scale-105 max-[761px]:left-2 max-[761px]:size-11 max-[761px]:top-1/2"
  >
    <ChevronLeft size={26} />
  </button>


  {/* RIGHT BUTTON */}
  <button
    type="button"
    onClick={nextRoom}
    aria-label="Next room"
    className="absolute right-4 top-[40%] z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg hover:scale-105 max-[761px]:right-2 max-[761px]:size-11 max-[761px]:top-1/2"
  >
    <ChevronRight size={26} />
  </button>

</div>

</section>
 <section
  className="electronics-feature max-lg:flex! max-lg:flex-col max-lg:gap-0! max-lg:p-0! max-lg:min-h-0!"
  style={{
    position: "relative",
    minHeight: "360px",
    width: "100%",
    overflow: "hidden",
    background: "#f3f2ef",
  }}
>
  {/* LEFT CONTENT */}
  <div
    className="electronics-copy max-lg:w-full! max-lg:min-h-0! max-lg:p-8! max-sm:p-6! max-sm:[&>h2]:text-[36px]! max-lg:[&>a]:self-start max-sm:[&>a]:max-w-full max-sm:[&>a]:gap-4!"
    style={{
      position: "relative",
      zIndex: 10,
      width: "70%",
      minHeight: "360px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      paddingLeft: "4%",
      paddingRight: "4%",
    }}
  >
    <span className="tiny-label">
      A SMARTER KIND OF EVERYDAY
    </span>

    <h2>
      Big moments.
      <br />
      Small conveniences.
    </h2>

    <p>
      From movie nights to laundry days, find electronics that fit right into
      your life.
    </p>

    <a className="showroom-button" href="/electronics">
      Explore electronics <ArrowUpRight size={19} />
    </a>
  </div>

  {/* RIGHT FULL IMAGE */}
  <div
    className="max-lg:relative! max-lg:inset-auto! max-lg:w-full! max-lg:h-[320px] max-sm:h-[240px] max-lg:shrink-0"
    style={{
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      width: "60%",
      overflow: "hidden",
    }}
  >
    <a
      href="/products/smart-tv"
      style={{
        display: "block",
        position: "absolute",
        inset: 0,
      }}
    >
      <img
        src="/images/ac.jpeg"
        alt="Explore televisions"
        loading="lazy"
        draggable={false}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          display: "block",
        }}
      />

      {/* LEFT WHITE FADE */}
      <div
        className="max-lg:hidden"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            linear-gradient(
              to right,
              #f3f2ef 0%,
              rgba(243,242,239,0.98) 5%,
              rgba(243,242,239,0.85) 15%,
              rgba(243,242,239,0.45) 27%,
              rgba(243,242,239,0.10) 40%,
              transparent 52%
            )
          `,
        }}
      />
    </a>
  </div>
</section>
<section className="favourites-section">
  <div className="showroom-heading max-sm:flex-col! max-sm:items-start! max-sm:[&>a]:max-w-none! max-sm:[&>a]:min-h-11! mb-7 flex items-end justify-between gap-[5px] max-[761px]:mb-[23px] max-[761px]:items-start max-[761px]:gap-[15px] max-[371px]:flex-wrap">
    <h2>Best Sellers</h2>

    <a href="/products">
      View the collection <ArrowUpRight size={18} />
    </a>
  </div>

  <Tabs value={tab} onValueChange={setTab}>
<Carousel
  opts={{
    align: "start",
    dragFree: true,
    duration: 35,
  }}
  className="w-full cursor-grab active:cursor-grabbing"
>
  <CarouselContent className="-ml-4 touch-pan-y">
    {products
      .filter((p) => tab === "All" || p.group === tab)
      .slice(0, tab === "All" ? 8 : 4)
      .map((p) => (
        <CarouselItem
          key={p.id}
          className="basis-1/4 pl-4 max-[1024px]:basis-1/3 max-[761px]:basis-1/2 max-[380px]:basis-[85%]!"
        >
          <div className="group relative select-none">
            
            {/* IMAGE */}
            <a
              href={"/products/" + p.id}
              className="relative block aspect-[4/5] overflow-hidden "
              draggable={false}
            >
              {/* DEFAULT IMAGE */}
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                draggable={false}
                className="
                  pointer-events-none
                  absolute inset-0
                  h-full w-full
                  object-contain
                  opacity-100
                  transition-opacity
                  duration-300
                  ease-in-out
                  group-hover:opacity-0
                "
              />

              {/* HOVER IMAGE */}
              <img
                src={p.hoverImage || p.image}
                alt={p.name}
                loading="lazy"
                draggable={false}
                className="
                  pointer-events-none
                  absolute inset-0
                  h-full w-full
                  object-contain
                  opacity-0
                  transition-opacity
                  duration-300
                  ease-in-out
                  group-hover:opacity-100
                "
              />
            </a>

            {/* WISHLIST */}
            <button
              type="button"
              aria-label={`Add ${p.name} to wishlist`}
              className="
                absolute right-4 top-4 z-20
                grid size-10 place-items-center
                rounded-full
                bg-transparent
                text-white
                opacity-0
                transition-opacity
                duration-200
                group-hover:opacity-100
              "
            >
              <Heart size={20} strokeWidth={1.5} />
            </button>

            {/* PRODUCT DETAILS */}
            <a
              href={"/products/" + p.id}
              className="block pt-4"
              draggable={false}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[16px] font-normal min-w-0 break-words max-sm:text-[14px]">
                  {p.name}
                </h3>

                <span className="whitespace-nowrap text-[14px]">
                  {/* {money(p.price)} */}
                </span>
              </div>
            </a>

          </div>
        </CarouselItem>
      ))}
  </CarouselContent>
</Carousel>
  </Tabs>
</section>
     
        {/* <section className="showroom-brands">
          <div className="showroom-heading max-sm:flex-col! max-sm:items-start! max-sm:[&>a]:max-w-none! max-sm:[&>a]:min-h-11! mb-7 flex items-end justify-between gap-[25px] max-[761px]:mb-[23px] max-[761px]:items-start max-[761px]:gap-[15px] max-[371px]:flex-wrap">
            <div>
              <h2>
                Familiar names.
                <br />
                Fresh possibilities.
              </h2>
            </div>
            <p>
              Explore electronics brands
              <br />
              in our sample catalogue.
            </p>
          </div>
          <div>
            {["LG", "BOSCH", "KitchenAid", "Liya’s Living"].map((b) => (
              <a
                href={
                  "/products?q=" + encodeURIComponent(b === "Liya’s Living" ? "Liyas Living" : b)
                }
                key={b}
              >
                {b}
              </a>
            ))}
          </div>
        </section> */}
 
          <div className="mx-auto max-w-[180vh] px-4 pt-18 max-sm:pt-12 sm:px-6 lg:px-8">

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
  <section
  className="
    relative
    z-0
    min-h-[480px]
    w-full
    overflow-hidden
    bg-cover
    bg-center
    bg-no-repeat
    max-[900px]:min-h-[580px]
    max-[700px]:min-h-[540px]
    max-lg:min-h-[440px]
  "
  style={{
    backgroundImage: "url('/images/bg.png')",
  }}
>
  {/* LEFT LAMP */}
  <img
    src="/images/lamp.png"
    alt="Decorative floor lamp"
    loading="lazy"
    className="
      pointer-events-none
      absolute
      bottom-0
      left-[3%]
      z-10
      h-[98%]
      w-auto
      object-contain
      max-[900px]:left-[10%]
      max-[900px]:h-full
      max-[900px]:-scale-x-100
      
    "
  />

  {/* LAMP LIGHT GLOW */}
<div
  className="pointer-events-none absolute left-[12%] top-[13%] z-[1] h-[360px] w-[420px] max-lg:hidden"
  style={{
    background:
      "linear-gradient(to bottom, rgba(255,205,110,0.34) 0%, rgba(255,215,140,0.18) 45%, rgba(235,230,215,0) 100%)",
    clipPath: "polygon(36% 0%, 63% 0%, 100% 100%, 0% 100%)",
    filter: "blur(10px)",
  }}
/>

  {/* CONTENT */}
  <div
  className="
    relative
    z-20
    ml-[19%]
    flex
    min-h-[540px]
    max-w-[680px]
    flex-col
    justify-center
    py-5
    mt-1

    max-[1100px]:ml-[31%]
    max-[900px]:ml-[36%]

    max-lg:ml-9!
    max-lg:max-w-none!
    max-lg:min-h-0!
    max-lg:mt-12!
    max-lg:mb-0!
    max-lg:px-8!
    max-lg:py-14!

    max-[700px]:ml-0
    max-[700px]:px-7
    max-[700px]:pt-24
    max-[700px]:mt-16!

    max-sm:px-6!
    max-sm:py-12!
    max-sm:mt-20!
  "
>
  

  <span
  className="
    text-[50px]
    font-serif
    font-normal
    
    leading-[1.06]
    text-[#302820]
    max-[1100px]:text-[60px]
    max-[700px]:text-[48px]
    max-[480px]:text-[40px]
  "
>
  See it. Feel it.
  <br />
  Make it yours.
</span>

<p
  className="
    mt-7
    text-[21px]
    leading-[1.65]
    text-[#3f392f]
    max-[700px]:text-[18px]
    max-[480px]:text-[16px]
  "
>
  Visit Liya’s Furniture & Electronics
  <br />
  Sheshashayi Complex, Sagara Road,
  <br />
  Thirthahalli.
</p>

    <a
      href="/contact"
      className="
        mt-6
        inline-flex
        w-fit
        items-center
        gap-10
        max-sm:gap-4 max-sm:max-w-full max-sm:px-5
        border
        border-black
        bg-transparent
        px-7
        py-3
        text-[15px]
        font-medium
        text-[#27231e]
      "
    >
      Visit our showroom
      <ArrowUpRight size={17} />
    </a>
  </div>

  {/* RIGHT SIDE IMAGE */}
<img
  src="/images/lamp1.png"
  alt="Furniture showcase"
  loading="lazy"
  className="
    pointer-events-none
    absolute
    bottom-0
    right-[3%]
    z-[5]
    top-[30%]
    h-[68%]
    w-auto
    object-contain
    max-[900px]:h-[62%]
    max-[700px]:hidden
    
  "
/>
{/* CLOCK */}
<img
  src="/images/clock.png"
  alt="Decorative wall clock"
  loading="lazy"
  className="
    pointer-events-none
    absolute
    right-[32%]
    top-[17%]
    z-50
    h-[38%]
    w-auto
    -translate-y-1/2
    object-contain
    max-[1100px]:right-[88%]
    max-[900px]:h-[28%]
   max-[900px]:top-[6%]
   max-[700px]:opacity-60
    
  "
/>
</section>
     <section className="w-full bg-white px-6 py-20 sm:px-10 lg:px-16 max-sm:py-12">
  <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-14 max-sm:gap-8 lg:grid-cols-[0.85fr_1.5fr] lg:gap-20">

    {/* LEFT HEADING */}
    <div className="flex flex-col justify-between">
      <div>
        <span className="mb-5 block text-[11px] font-medium uppercase tracking-[0.32em] text-[#9b0090]">
          WHY LIYA’S
        </span>

        <h2 className="font-serif text-[46px] font-normal leading-[1.05] tracking-[-0.025em] text-[#2f2a24] sm:text-[56px] lg:text-[64px]">
          Good things
          <br />
          for the place
          <br />
          you call home.
        </h2>
      </div>

      <p className="mt-8 max-w-[360px] text-[16px] leading-7 text-[#70685e]">
        Furniture, electronics and friendly local support designed around
        everyday living.
      </p>
    </div>

    {/* RIGHT FEATURES */}
    <div className="border-t border-[#c9c0b1]">

      {/* FEATURE 01 */}
      <article className="grid grid-cols-[55px_55px_1fr] max-sm:grid-cols-[44px_minmax(0,1fr)] max-sm:gap-x-4 max-sm:gap-y-2 max-sm:[&>span]:col-start-1 max-sm:[&>span]:row-start-1 max-sm:[&>div:nth-child(2)]:col-start-1 max-sm:[&>div:nth-child(2)]:row-start-2 max-sm:[&>div:nth-child(2)]:size-11 max-sm:[&>div:last-child]:col-start-2 max-sm:[&>div:last-child]:row-start-1 max-sm:[&>div:last-child]:row-span-2 max-sm:[&>div:last-child]:min-w-0 max-sm:py-6 items-start gap-5 border-b border-[#c9c0b1] py-9 sm:grid-cols-[70px_65px_1fr] sm:gap-7">

        <span className="pt-2 text-[12px] tracking-[0.2em] text-[#9b0090]">
          01
        </span>

        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#aaa091]">
          <Truck size={22} strokeWidth={1.3} />
        </div>

        <div>
          <h3 className="font-serif text-[28px] max-sm:text-[25px] max-sm:leading-tight font-normal text-[#2d2924] sm:text-[32px]">
            Delivery made easier
          </h3>

          <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#746d63] sm:text-[16px]">
            Ask us about convenient local delivery and store pickup options.
          </p>
        </div>
      </article>

      {/* FEATURE 02 */}
      <article className="grid grid-cols-[55px_55px_1fr] max-sm:grid-cols-[44px_minmax(0,1fr)] max-sm:gap-x-4 max-sm:gap-y-2 max-sm:[&>span]:col-start-1 max-sm:[&>span]:row-start-1 max-sm:[&>div:nth-child(2)]:col-start-1 max-sm:[&>div:nth-child(2)]:row-start-2 max-sm:[&>div:nth-child(2)]:size-11 max-sm:[&>div:last-child]:col-start-2 max-sm:[&>div:last-child]:row-start-1 max-sm:[&>div:last-child]:row-span-2 max-sm:[&>div:last-child]:min-w-0 max-sm:py-6 items-start gap-5 border-b border-[#c9c0b1] py-9 sm:grid-cols-[70px_65px_1fr] sm:gap-7">

        <span className="pt-2 text-[12px] tracking-[0.2em] text-[#9b0090]">
          02
        </span>

        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#aaa091]">
          <ShieldCheck size={22} strokeWidth={1.3} />
        </div>

        <div>
          <h3 className="font-serif text-[28px] max-sm:text-[25px] max-sm:leading-tight font-normal text-[#2d2924] sm:text-[32px]">
            Choices you can rely on
          </h3>

          <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#746d63] sm:text-[16px]">
            Practical furniture and electronics chosen for everyday comfort and
            convenience.
          </p>
        </div>
      </article>

      {/* FEATURE 03 */}
      <article className="grid grid-cols-[55px_55px_1fr] max-sm:grid-cols-[44px_minmax(0,1fr)] max-sm:gap-x-4 max-sm:gap-y-2 max-sm:[&>span]:col-start-1 max-sm:[&>span]:row-start-1 max-sm:[&>div:nth-child(2)]:col-start-1 max-sm:[&>div:nth-child(2)]:row-start-2 max-sm:[&>div:nth-child(2)]:size-11 max-sm:[&>div:last-child]:col-start-2 max-sm:[&>div:last-child]:row-start-1 max-sm:[&>div:last-child]:row-span-2 max-sm:[&>div:last-child]:min-w-0 max-sm:py-6 items-start gap-5 border-b border-[#c9c0b1] py-9 sm:grid-cols-[70px_65px_1fr] sm:gap-7">

        <span className="pt-2 text-[12px] tracking-[0.2em] text-[#9b0090]">
          03
        </span>

        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#aaa091]">
          <Headphones size={22} strokeWidth={1.3} />
        </div>

        <div>
          <h3 className="font-serif text-[28px] max-sm:text-[25px] max-sm:leading-tight font-normal text-[#2d2924] sm:text-[32px]">
            Local support, close by
          </h3>

          <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#746d63] sm:text-[16px]">
            Friendly help from our team right here in Thirthahalli whenever you
            need it.
          </p>
        </div>
      </article>

    </div>
  </div>
</section>
    </div>
  );
}
