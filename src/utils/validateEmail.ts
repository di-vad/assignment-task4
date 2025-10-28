export function validateEmail(input: string): boolean {
  const value = input.trim();

  if (!value || value.length > 254) return false;

  if (/\s/.test(value)) return false;

  const atCount = (value.match(/@/g) || []).length;
  if (atCount !== 1) return false;

  const emailRegex = /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}$/;

  if (!emailRegex.test(value)) return false;

  if (/\.\./.test(value)) return false;

  const [, domain] = value.split("@");
  const labels = domain.split(".");
  if (
    labels.some((l) => l.startsWith("-") || l.endsWith("-") || l.length === 0)
  ) {
    return false;
  }

  return true;
}
