import { PriorityQueue } from 'typescript-collections';

export class ReuseIdManager {
  used = new Set<number>();
  unusedWait = new PriorityQueue<IdAndTime>(compareIdAndTime);
  unused = new PriorityQueue<number>(compareId);

  constructor(public waitTime: number) {}

  getId() {
    const now = Date.now();
    for (;;) {
      const nextUnusedWait = this.unusedWait.peek();
      if (nextUnusedWait !== undefined && nextUnusedWait.time <= now) {
        this.unusedWait.dequeue();
        this.unused.enqueue(nextUnusedWait.id);
      } else {
        break;
      }
    }

    let nextId = this.unused.dequeue();
    if (nextId === undefined) {
      nextId = this.used.size + this.unusedWait.size() + 1;
    }

    this.used.add(nextId);

    return nextId;
  }

  returnId(id: number) {
    const deleted = this.used.delete(id);
    if (deleted) {
      this.unusedWait.enqueue(new IdAndTime(id, Date.now() + this.waitTime));
    }
  }
}

class IdAndTime {
  constructor(
    public id: number,
    public time: number,
  ) {}
}

function compareIdAndTime(a: IdAndTime, b: IdAndTime) {
  return b.time - a.time;
}

function compareId(a: number, b: number) {
  return b - a;
}
