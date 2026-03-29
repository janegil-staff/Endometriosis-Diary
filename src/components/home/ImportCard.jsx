"use client";
import Image from "next/image";

export default function ImportCard({
  t,
  code,
  error,
  setError,
  handleChange,
  handleClick,
}) {
  return (
    <div className="w-full max-w-[400px] mx-auto min-[900px]:w-[400px] min-[900px]:mx-0 flex-shrink-0">
      <div
        className="rounded-2xl overflow-hidden shadow-lg"
        style={{
          background: "rgba(255,255,255,0.82)",
          border: "1px solid rgba(201,112,96,0.18)",
          backdropFilter: "blur(10px)",
          padding: 40,
        }}
      >
        {/* Screenshots — hidden on mobile */}
        <div
          className="relative overflow-hidden min-[600px]:block"
          style={{ height: 180 }}
        >
          <div className="overflow-hidden">
            <Image
              height={300}
              width={130}
              src="/welcome3.png"
              alt="App home"
              style={{
                width: "200%",
                height: "auto",
                display: "block",
                marginLeft: 0,
              }}
            />
          </div>
          <div className="absolute top-0 right-0">
            <Image height={50} width={50} src="/logo.png" alt="App settings" />
          </div>
          <div
            className="absolute inset-y-0"
            style={{
              left: "50%",
              transform: "translateX(-50%)",
              width: 2,
              background: "rgba(255,255,255,0.6)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: 80,
              background:
                "linear-gradient(to bottom, transparent, rgba(255,255,255,0.95))",
            }}
          />
        </div>

        {/* Form */}
        <div className="px-5 pb-5">
          <p className="text-center font-bold tracking-widest text-sm mb-4 uppercase"
            style={{ color: "#5a3a34" }}>
            {t.importTitle}
          </p>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: "#b07a70" }}>
            {t.importLabel}
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => {
              handleChange(e.target.value);
              setError(false);
            }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleClick(e); } }}
            placeholder={t.placeholder}
            className="w-full rounded-lg px-4 py-3 text-sm mb-1 outline-none transition-all"
            style={{
              background: "#fdf4f2",
              color: "#5a3a34",
              border: `1px solid ${error ? "#e53e3e" : "rgba(201,112,96,0.25)"}`,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = error ? "#e53e3e" : "#c97060";
              e.target.style.boxShadow = "0 0 0 3px rgba(201,112,96,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error ? "#e53e3e" : "rgba(201,112,96,0.25)";
              e.target.style.boxShadow = "none";
            }}
          />
          {error && (
            <p className="text-xs mt-1 mb-2 tracking-wide" style={{ color: "#e53e3e" }}>
              {t.invalidCode}
            </p>
          )}
          <div className="mb-3" />
          <button
            onClick={handleClick}
            className="w-full py-3 rounded-lg text-white text-sm font-bold tracking-widest uppercase transition-all hover:opacity-90"
            style={{ background: "#c97060" }}
          >
            {t.importButton}
          </button>
        </div>
      </div>
    </div>
  );
}