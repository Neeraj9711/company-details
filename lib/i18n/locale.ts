import type { CompanyStatus } from "@/lib/api/types";

export type Locale = "nl" | "en";

export const LOCALE_COOKIE = "locale";

export type Messages = {
  appTitle: string;
  languageLabel: string;
  signInTitle: string;
  signInHelp: string;
  signUpTitle: string;
  signUpHelp: string;
  signUpSubmit: string;
  signingUp: string;
  tokenIssuedTitle: string;
  tokenIssuedHelp: string;
  copyToken: string;
  copied: string;
  goToLogin: string;
  goToSignUp: string;
  hasToken: string;
  noAccount: string;
  tokenLabel: string;
  tokenRequired: string;
  tokenInvalid: string;
  authError: string;
  loginSubmit: string;
  loggingIn: string;
  signOut: string;
  companiesTitle: string;
  companiesIntro: string;
  searchLabel: string;
  searchPlaceholder: string;
  statusLabel: string;
  statusAll: string;
  status: Record<CompanyStatus, string>;
  columnName: string;
  columnDomain: string;
  columnStatus: string;
  columnCreated: string;
  newCompany: string;
  emptyDomain: string;
  loading: string;
  retry: string;
  listError: string;
  emptyTitle: string;
  emptyFilteredTitle: string;
  emptyBody: string;
  emptyFilteredBody: string;
  previousPage: string;
  nextPage: string;
  pagination: string;
  paginationLabel: string;
  close: string;
  cancel: string;
  save: string;
  saving: string;
  createTitle: string;
  editTitle: string;
  nameLabel: string;
  domainLabel: string;
  domainHint: string;
  nameRequired: string;
  validationSummary: string;
  conflictTitle: string;
  conflictBody: string;
  reloadLatest: string;
  reloading: string;
  serverNow: string;
  drawerLoading: string;
  drawerError: string;
  drawerMissing: string;
  saveError: string;
  routeErrorTitle: string;
  routeErrorBody: string;
  tryAgain: string;
  editingVersion: string;
};

export function isLocale(value: string): value is Locale {
  return value === "nl" || value === "en";
}

export function resolveLocale(value: string | undefined): Locale {
  return value && isLocale(value) ? value : "en";
}

export function localeTag(locale: Locale): string {
  return locale === "nl" ? "nl-NL" : "en-GB";
}
