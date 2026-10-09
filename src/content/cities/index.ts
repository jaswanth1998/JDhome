import type { CityPageCopy, CoreCitySlug } from "./types";
import { oshawa } from "./oshawa";
import { whitby } from "./whitby";
import { ajax } from "./ajax";
import { pickering } from "./pickering";
import { courtice } from "./courtice";
import { bowmanville } from "./bowmanville";

/** Unique page copy for each core city, keyed by theme.serviceCities slug. */
export const CITY_PAGES: Readonly<Record<CoreCitySlug, CityPageCopy>> = {
  oshawa,
  whitby,
  ajax,
  pickering,
  courtice,
  bowmanville,
};

export function getCityPage(slug: string): CityPageCopy | undefined {
  return (CITY_PAGES as Record<string, CityPageCopy | undefined>)[slug];
}

export type { CityFaq, CityPageCopy, CitySection, CoreCitySlug } from "./types";
