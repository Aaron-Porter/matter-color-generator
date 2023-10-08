import styles from "./page.module.css";

import Jimp from "jimp";
import {
  argbFromHex,
  themeFromSourceColor,
  applyTheme,
  QuantizerCelebi,
  Score,
  SchemeExpressive,
  Hct,
  MaterialDynamicColors,
  hexFromArgb,
  SchemeTonalSpot,
  SchemeVibrant,
  TonalPalette,
  CorePalette,
  Blend,
  TemperatureCache,
  Contrast,
  SchemeFidelity,
} from "@material/material-color-utilities";
import Generate from "./GenerateUI";
import Image from "next/image";

const generateColorsFromImage = async (imageUrl) => {
  let argbArray = [];

  return Jimp.read(`./public${imageUrl}`)
    .then((image) => {
      image.scan(
        0,
        0,
        image.bitmap.width,
        image.bitmap.height,
        function (x, y, idx) {
          const rgba = Jimp.intToRGBA(image.getPixelColor(x, y));
          const argbFromRgba = (rgba) => {
            return (rgba.a << 24) | (rgba.r << 16) | (rgba.g << 8) | rgba.b;
          };
          argbArray.push(argbFromRgba(rgba));
        }
      );
    })
    .then(() => {
      // Pull colors from image
      const quantizerResult = QuantizerCelebi.quantize(argbArray, 128);

      // Filter out greyscale colors
      const filteredMap = new Map(
        Array.from(quantizerResult.entries()).filter(([key, value]) => {
          // Specify your filtering condition
          const color = Hct.fromInt(key);

          return color.internalChroma > 20; // Example: Keep entries with keys greater than 2
        })
      );

      // Score colors for use in UI
      const colors = Score.score(filteredMap, { filter: true });

      // Generate a color scheme
      const scheme = new SchemeFidelity(Hct.fromInt(colors[0]), false, 0);

      // Get the primary color
      const primary = MaterialDynamicColors.primary.getArgb(scheme);
      const secondary = MaterialDynamicColors.secondary.getArgb(scheme);
      const tertiary = MaterialDynamicColors.tertiary.getArgb(scheme);

      return {
        primary: hexFromArgb(primary),
        secondary: hexFromArgb(secondary),
        tertiary: hexFromArgb(tertiary),
      };
    });
};

function Images() {
  const images = [
    "/images/cover_1.png",
    "/images/cover_2.png",
    "/images/cover_3.png",
    "/images/cover_4.png",
    "/images/cover_5.png",
    "/images/cover_6.png",
    "/images/cover_7.png",
    "/images/cover_8.png",
    "/images/cover_9.png",
    "/images/cover_10.png",
    "/images/cover_11.png",
    "/images/cover_12.png",
    "/images/cover_13.png",
  ];

  return (
    <div>
      {images.map(async (image, index) => {
        const colors = await generateColorsFromImage(image);

        return (
          <div key={index} style={{ display: "flex", padding: "24px" }}>
            <Image src={image} width={200} height={200} />
            <div
              style={{
                backgroundColor: colors.primary,
                width: "200px",
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ color: "#fff" }}>Primary {colors.primary}</p>
            </div>
            <div
              style={{
                backgroundColor: colors.secondary,
                width: "200px",
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ color: "#fff" }}>Secondary {colors.secondary}</p>
            </div>
            <div
              style={{
                backgroundColor: colors.tertiary,
                width: "200px",
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ color: "#fff" }}>Tertiary {colors.tertiary}</p>
            </div>
            <div
              style={{
                background: `linear-gradient(${colors.primary}, ${colors.secondary})`,
                width: "200px",
                height: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ color: "#fff" }}>Gradient</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default async function Home() {
  return (
    <main className={styles.main}>
      <Images />
    </main>
  );
}
