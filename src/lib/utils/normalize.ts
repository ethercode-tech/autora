export function normalizeName(value: string) {
  return value.trim().toLocaleLowerCase("es-AR").replace(/\s+/g, " ");
}
