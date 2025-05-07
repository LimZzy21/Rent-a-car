export default function removeProperties<T, K extends keyof T>(
  obj: T,
  ...propsToRemove: K[]
): Omit<T, K> {
  const copy = { ...obj };
  for (const prop of propsToRemove) {
    delete copy[prop];
  }
  return copy;
}