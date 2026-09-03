export default function Footer() {
  return (
    <footer id="kontak" className="mt-10 border-t border-brandBrown/10 bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <span className="font-display text-2xl text-brandRed">HerS Culinary</span>
          <p className="mt-2 text-sm text-brandBrown/70">
            Frozen food &amp; kopi pilihan. Dibuat dengan cinta untuk rasa terbaik.
          </p>
        </div>
        <div className="text-sm text-brandBrown/70">
          <p className="font-bold text-brandBrown">Kontak Pemesanan</p>
          <p className="mt-2">
            Chat kami di WhatsApp untuk pemesanan, tanya stok, atau ongkos kirim.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold text-brandBrown/70 md:justify-end md:text-right">
          <span className="rounded-full bg-cream px-3 py-1">✓ Kualitas Terjamin</span>
          <span className="rounded-full bg-cream px-3 py-1">❄ Fresh &amp; Higienis</span>
          <span className="rounded-full bg-cream px-3 py-1">👍 Rasa Memuaskan</span>
        </div>
      </div>
      <div className="bg-brandRedDark py-3 text-center text-xs text-white/80">
        © {new Date().getFullYear()} HerS Culinary. Semua hak dilindungi.
      </div>
    </footer>
  );
}
