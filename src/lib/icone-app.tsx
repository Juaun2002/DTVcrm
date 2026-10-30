import { ImageResponse } from "next/og";

/** Ícone do app (DTV sobre degradê verde-azulado), gerado como PNG. */
export function iconeApp(tamanho: number, arredondado = true) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #14b8a6 0%, #047857 100%)",
          borderRadius: arredondado ? tamanho * 0.22 : 0,
          color: "white",
          fontSize: tamanho * 0.34,
          fontWeight: 900,
          letterSpacing: -tamanho * 0.01,
        }}
      >
        DTV
      </div>
    ),
    { width: tamanho, height: tamanho },
  );
}
