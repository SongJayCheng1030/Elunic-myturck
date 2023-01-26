export type ReleaseFn = () => void;

export class Mutex {
  private mutex: { [key: string]: string } = {};

  async acquire(seed?: string): Promise<ReleaseFn> {
    const id = `${seed || 'default'}`;

    // Random sleep to circumvent the missing atomic instructions
    const sleep = Math.round(Math.random() * 10);
    await new Promise(r => setTimeout(r, sleep));

    // Busy waiting while mutex is held
    while (typeof this.mutex[id] !== 'undefined') {
      await new Promise(r => setTimeout(r, 42));
    }

    // Lock
    this.mutex[id] = id;

    // Release function
    const _this = this;
    return () => {
      _this.release(seed);
    };
  }

  release(seed?: string) {
    const id = `${seed || 'default'}`;
    delete this.mutex[id];
  }
}
