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
import Image from "next/image";
import { RGBA } from "@jimp/core";

const generateColorsFromImage = async (imageUrl: string) => {
  let argbArray: number[] = [];

  return Jimp.read(`./public${imageUrl}`)
    .then((image) => {
      image.scan(
        0,
        0,
        image.bitmap.width,
        image.bitmap.height,
        function (x, y, idx) {
          const rgba = Jimp.intToRGBA(image.getPixelColor(x, y));
          const argbFromRgba = (rgba: RGBA) => {
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

      // Set primary
      const primary = colors[0];

      const manipulateTone = (int: number, multiplier: number) => {
        const HCT = Hct.fromInt(primary);
        HCT.tone = HCT.tone * multiplier;
        return HCT.toInt();
      };

      // Manipulate primary to derive other colors
      const secondary = manipulateTone(primary, 0.6);
      const tertiary = manipulateTone(primary, 0.3);

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
            <Image src={image} width={200} height={200} alt="" />
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
                background: `linear-gradient(${colors.secondary}, ${colors.tertiary})`,
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
