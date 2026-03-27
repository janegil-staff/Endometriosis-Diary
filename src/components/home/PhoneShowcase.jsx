import Image from "next/image";

export default function PhoneShowcase({ t }) {
  return (
    <div className="w-full min-[900px]:flex-1 min-[900px]:min-w-[300px] min-[900px]:max-w-[580px]">
      <div className="flex items-end gap-2 min-[900px]:gap-3 justify-center min-[900px]:justify-start">
        {[
          { src: "/screen2.png", alt: "Login" },
          { src: "/screen1.png", alt: "Calendar", lift: true },
          { src: "/screen3.png", alt: "Charts" },
        ].map(({ src, alt, lift }) => (
          <div
            key={src}
            className="flex-shrink-0 overflow-hidden shadow-2xl w-[90px] min-[900px]:w-[160px]"
            style={{
              marginBottom: lift ? 16 : 0,
              border: "4px solid #1a1a1a",
              borderRadius: 20,
              background: "#1a1a1a",
            }}
          >
            <Image
              height={300}
              width={130}
              src={src}
              alt={alt}
              style={{ width: "100%", height: "auto", display: "block", borderRadius: 16 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}