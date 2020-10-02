import { PriorityQueue } from 'typescript-collections';

export class ReuseIDManager {
  used = new Set<number>();
  unusedWait = new PriorityQueue<IDAndTime>(compareIDAndTime);
  unused = new PriorityQueue<number>(compareID);

  constructor(public waitTime: number) {}

  getID() {
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

    let nextID = this.unused.dequeue();
    if (nextID === undefined) {
      nextID = this.used.size + this.unusedWait.size() + 1;
    }

    this.used.add(nextID);

    return nextID;
  }

  returnID(id: number) {
    const deleted = this.used.delete(id);
    if (deleted) {
      this.unusedWait.enqueue(new IDAndTime(id, Date.now() + this.waitTime));
    }
  }
}

class IDAndTime {
  constructor(public id: number, public time: number) {}
}

function compareIDAndTime(a: IDAndTime, b: IDAndTime) {
  return b.time - a.time;
}

function compareID(a: number, b: number) {
  return b - a;
}
