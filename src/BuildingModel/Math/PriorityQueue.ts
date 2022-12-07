export default class PriorityQueue<T> {
  private array: T[];
  private size: number;
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number) {
    this.array = [];
    this.size = 0;
    this.comparator = comparator;
  }

  // Add an element the the queue
  public add(myval: T): void {
    let i = this.size;
    this.array[this.size] = myval;
    this.size += 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      const ap = this.array[p];
      if (this.comparator(myval, ap) > 0) {
        break;
      }
      this.array[i] = ap;
      i = p;
    }
    this.array[i] = myval;
  }

  // replace the content of the heap by provided array and "heapifies it"
  public heapify(arr: T[]): void {
    this.array = arr;
    this.size = arr.length;
    for (let i = (this.size >> 1); i >= 0; i--) {
      this.percolateDown(i);
    }
  }

  // for internal use
  private percolateUp(i: number) {
    let myval = this.array[i];
    while (i > 0) {
      const p = (i - 1) >> 1;
      const ap = this.array[p];
      if (this.comparator(myval, ap) > 0) {
        break;
      }
      this.array[i] = ap;
      i = p;
    }
    this.array[i] = myval;
  }

  // for internal use
  private percolateDown(i: number) {
    let size = this.size;
    let hsize = this.size >>> 1;
    let ai = this.array[i];
    while (i < hsize) {
      let l = (i << 1) + 1;
      const r = l + 1;
      let bestc = this.array[l];
      if (r < size) {
        if (this.comparator(this.array[r], bestc) <= 0) {
          l = r;
          bestc = this.array[r];
        }
      }
      if (this.comparator(bestc, ai) > 0) {
        break;
      }
      this.array[i] = bestc;
      i = l;
    }
    this.array[i] = ai;
  }

  // Look at the top of the queue (a smallest element)
  // executes in constant time
  //
  // Calling peek on an empty priority queue returns
  // the "undefined" value.
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/undefined
  //
  public peek(): T | undefined {
    if (this.size === 0) return undefined;
    return this.array[0];
  }

  // remove the element on top of the heap (a smallest element)
  // runs in logarithmic time
  //
  // If the priority queue is empty, the function returns the
  // "undefined" value.
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/undefined
  //
  // For long-running and large priority queues, or priority queues
  // storing large objects, you may  want to call the trim function
  // at strategic times to recover allocated memory.
  public poll(): T | undefined {
    if (this.size === 0)
      return undefined;
    let out = this.array[0];
    if (this.size > 1) {
      this.array[0] = this.array[--this.size];
      this.percolateDown(0 | 0);
    } else {
      this.size -= 1;
    }
    return out;
  }

  // This function adds the provided value to the heap, while removing
  //  and returning the peek value (like poll). The size of the priority
  // thus remains unchanged.
  replaceTop(myval: T): T | undefined {
    if (this.size == 0)
      return undefined;
    let out = this.array[0];
    this.array[0] = myval;
    this.percolateDown(0 | 0);
    return out;
  }


  // recover unused memory (for long-running priority queues)
  public trim() {
    this.array = this.array.slice(0, this.size);
  }

  // Check whether the heap is empty
  public isEmpty() {
    return this.size === 0;
  }
}