"use client";

import Image, { StaticImageData } from "next/image";
import Hero from "@/public/hero.svg";
import HeroDark from "@/public/hero-dark.svg";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";

export default function HeroImage() {
  const { resolvedTheme } = useTheme();
  const [heroImage, setHeroImage] = useState<StaticImageData>(Hero);
  useEffect(() => {
    setHeroImage(resolvedTheme === "dark" ? HeroDark : Hero);
  }, [resolvedTheme]);

  return <Image src={heroImage} alt="Logo" priority className="" />;
}
