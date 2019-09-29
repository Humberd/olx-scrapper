import * as storage from 'node-persist';

const KEY = 'visited';

export class Visited {
  private visited: Set<string>;

  async init() {
    await storage.init();
    const storedItems = await storage.getItem(KEY);
    if (Array.isArray(storedItems)) {
      this.visited = new Set<string>(storedItems);
    } else {
      this.visited = new Set<string>();
    }

    setInterval(() => {
      storage.setItem(KEY, Array.from(this.visited))
    }, 5000)
  }

  add(id: string) {
    this.visited.add(id);
  }

  has(id: string) {
    return this.visited.has(id)
  }


}
