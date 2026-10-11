const listeners = new Set<() => void>();

export const introGate = {
  done: true,
  finish() {
    if (this.done) return;
    this.done = true;
    listeners.forEach((listener) => listener());
    listeners.clear();
  },
  wait() {
    if (this.done) return Promise.resolve();
    return new Promise<void>((resolve) => {
      listeners.add(resolve);
    });
  },
};
