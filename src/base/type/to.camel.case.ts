export function toCamelCase(input) {
  if (Array.isArray(input)) {
    return input.map(toCamelCase); // Рекурсивно обрабатываем массив
  } else if (input !== null && typeof input === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(input)) {
      const camelCaseKey = key.replace(/_([a-z])/g, (_, char) =>
        char.toUpperCase(),
      );
      result[camelCaseKey] = toCamelCase(value); // Рекурсивно обрабатываем значение
    }
    return result;
  }
  return input; // Если это не объект и не массив, возвращаем как есть
}
