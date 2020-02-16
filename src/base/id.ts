let nextId = 0;

export function generateId() {
  return `${nextId++}`;
}
