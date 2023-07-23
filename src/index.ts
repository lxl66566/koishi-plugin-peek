import { Context, Schema, h } from "koishi";
import screenshot from "screenshot-desktop";
import sharp from "sharp";

export const name = "peek";
export interface Config {
  blur: number;
}
export const Config: Schema<Config> = Schema.object({
  blur: Schema.number()
    .default(0)
    .description("Gaussian Blur's radius, 0 means no blur"),
});

async function applyGaussianBlur(
  imageBuffer: Buffer,
  radius: number
): Promise<Buffer> {
  if (radius === 0) {
    return imageBuffer;
  }
  try {
    const resultBuffer = await sharp(imageBuffer).blur(radius).toBuffer();
    return resultBuffer;
  } catch (error) {
    console.error("Error applying Gaussian blur:", error);
    throw error;
  }
}

export function apply(ctx: Context, config: Config) {
  ctx.on("message", (session) => {
    if (session.content === "peek") {
      screenshot()
        .then((imageString) => {
          return applyGaussianBlur(
            Buffer.from(imageString, "base64"),
            config.blur
          );
        })
        .then((imageBuffer) => {
          session.send(h.image(imageBuffer, "image/png"));
        })
        .catch((e) => {
          session.send(e);
        });
    }
  });
}
