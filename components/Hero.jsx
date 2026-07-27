import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <div className="overflow-hidden rounded-3xl shadow-card">
          <Image
            src="/banner.png"
            alt="HerS Culinary — Frozen Food & Kopi Pilihan"
            width={1680}
            height={945}
            priority
            className="h-auto w-full object-cover"
          />
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-6xl flex-col items-center gap-3 px-4 text-center sm:px-6">
        <div className="frost-steam-divider">
          <span>❄ Frozen Food</span>
          <span className="text-brandGold">•</span>
          <span>☕ Kopi Pilihan</span>
        </div>
        <h1 className="font-display text-3xl text-brandRedDark sm:text-4xl">
          Lezat, praktis, siap dinikmati kapan saja
        </h1>
        <p className="max-w-xl text-sm text-brandBrown/70 sm:text-base">
          Jelajahi katalog produk kami — pilih kategori, temukan favoritmu, lalu pesan langsung lewat WhatsApp.
        </p>
      </div>
    </section>
  );
}
