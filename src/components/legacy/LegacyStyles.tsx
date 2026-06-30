/** Loads original server CSS sheets (paths match eabhijog-server /static/css/). */
export function LegacyStyles({ sheets }: { sheets: string[] }) {
  return (
    <>
      {sheets.map((sheet) => (
        <link key={sheet} rel="stylesheet" href={`/static/css/${sheet}`} />
      ))}
    </>
  );
}
