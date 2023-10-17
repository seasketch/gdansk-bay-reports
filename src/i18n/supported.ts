export interface LangDetails {
  /** language name in English */
  name: string;
  /** language name in that language */
  localName?: string;
  /** language code, as defined in poeditor */
  code: string;
  /** is language direction right-to-left */
  rtl?: boolean;
}

const languages: LangDetails[] = [
  { name: "English", localName: "English", code: "EN" },
  ...[
    {
      name: "Polish",
      code: "pl",
      localName: "Polski",
    },
    {
      name: "Russian",
      code: "ru",
      localName: "Русский",
    },
  ].sort((a, b) => a.name.localeCompare(b.name)),
];

export default languages;
