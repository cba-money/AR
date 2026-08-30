function pathJoin(...parts: any[]) {
  return parts
    .map((part, index) => {
      if (index === 0) {
        return part.trim().replace(/[/]+$/, ''); // Keep leading slash, remove trailing
      }
      return part.trim().replace(/^[/]+|[/]+$/g, ''); // Remove both leading & trailing
    })
    .filter(x => x.length > 0)
    .join('/');
}
export { pathJoin };