import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buttonClassName,
  publicButtonClassName,
  type ButtonSize,
  type ButtonVariant,
  type PublicButtonSize,
  type PublicButtonVariant,
} from "@/components/ds/buttonStyles";

describe("buttonStyles pressed states (T001 / AC-B1)", () => {
  const variants: ButtonVariant[] = ["primary", "secondary", "ghost", "danger"];
  const sizes: ButtonSize[] = ["sm", "md"];

  it("ensures every enabled variant contains an active: class", () => {
    for (const variant of variants) {
      for (const size of sizes) {
        const cls = buttonClassName(variant, size, false);
        assert.match(
          cls,
          /\bactive:\S+/,
          `Expected enabled button variant "${variant}" (${size}) to contain an active: class, got: "${cls}"`,
        );
      }
    }
  });

  it("ensures disabled variants do not contain an active: class", () => {
    for (const variant of variants) {
      for (const size of sizes) {
        const cls = buttonClassName(variant, size, true);
        assert.doesNotMatch(
          cls,
          /\bactive:\S+/,
          `Expected disabled button variant "${variant}" (${size}) to not contain any active: class, got: "${cls}"`,
        );
      }
    }
  });

  it("ensures publicButtonClassName variants contain active: classes", () => {
    const publicVariants: PublicButtonVariant[] = ["primary", "secondary", "tonal", "danger", "ghost"];
    const publicSizes: PublicButtonSize[] = ["sm", "md"];
    for (const variant of publicVariants) {
      for (const size of publicSizes) {
        const cls = publicButtonClassName(variant, size);
        assert.match(
          cls,
          /\bactive:\S+/,
          `Expected public button variant "${variant}" (${size}) to contain an active: class, got: "${cls}"`,
        );
      }
    }
  });

  it("ensures the pressed state differs from the hover state (pressed must be visible while hovered)", () => {
    const utility = (cls: string, prefix: string) => cls.split(/\s+/).find((c) => c.startsWith(prefix))?.slice(prefix.length);
    const cases: Array<[string, string]> = [
      ...variants.map((v) => [`app ${v}`, buttonClassName(v, "md", false)] as [string, string]),
      ...(["primary", "secondary", "tonal", "danger", "ghost"] as PublicButtonVariant[]).map(
        (v) => [`public ${v}`, publicButtonClassName(v, "md")] as [string, string],
      ),
    ];
    for (const [name, cls] of cases) {
      const hover = utility(cls, "hover:");
      const active = utility(cls, "active:");
      assert.ok(active, `${name}: missing active: class`);
      assert.notEqual(active, hover, `${name}: active:${active} repeats hover:${hover}, so pressing looks the same as hovering`);
    }
  });
});
