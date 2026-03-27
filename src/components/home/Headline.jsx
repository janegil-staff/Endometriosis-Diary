import React from "react";

const Headline = ({ t }) => {
  return (
    <div className="w-full min-[900px]:w-auto min-[900px]:flex-1 min-[900px]:min-w-[300px] min-[900px]:max-w-[580px] text-center min-[900px]:text-left">
      <h1
        className="font-bold mb-3 leading-tight"
        style={{
          color: "#5A3A34",
          fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
          fontFamily: "Georgia, serif",
        }}
      >
        {t.title}
      </h1>
      <p
        className="mb-8 leading-relaxed max-w-[460px] mx-auto min-[900px]:mx-0"
        style={{ color: "#5A3A34", fontSize: "0.97rem" }}
      >
        {t.subtitle}
      </p>
    </div>
  );
};

export default Headline;
