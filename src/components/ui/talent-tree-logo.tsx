/** The fixed-size local artwork needs no image optimizer or client-side image runtime. */
export function TalentTreeLogo({ decorative = false }: { decorative?: boolean }) {
  return (
    <img
      className="talent-tree-logo"
      src="/talent-tree-logo-2026.png"
      alt={decorative ? "" : "Talent Tree official logo"}
      width={132}
      height={108}
      loading="eager"
      decoding="async"
    />
  );
}
