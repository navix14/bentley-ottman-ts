class PriorityQueue<T> {
  private heap: T[];
  private compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number) {
    this.heap = [];
    this.compare = compare;
  }

  private getParentIndex(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private getLeftChildIndex(index: number): number {
    return index * 2 + 1;
  }

  private getRightChildIndex(index: number): number {
    return index * 2 + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private upHeap(index: number): void {
    if (index === 0) return;

    const parentIndex = this.getParentIndex(index);
    if (this.compare(this.heap[index], this.heap[parentIndex]) < 0) {
      this.swap(index, parentIndex);
      this.upHeap(parentIndex);
    }
  }

  private downHeap(index: number): void {
    const leftChildIndex = this.getLeftChildIndex(index);
    const rightChildIndex = this.getRightChildIndex(index);

    let minIndex = index;

    if (
      leftChildIndex < this.heap.length &&
      this.compare(this.heap[leftChildIndex], this.heap[minIndex]) < 0
    ) {
      minIndex = leftChildIndex;
    }

    if (
      rightChildIndex < this.heap.length &&
      this.compare(this.heap[rightChildIndex], this.heap[minIndex]) < 0
    ) {
      minIndex = rightChildIndex;
    }

    if (minIndex !== index) {
      this.swap(index, minIndex);
      this.downHeap(minIndex);
    }
  }

  size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  list() {
    return this.heap;
  }

  remove(element: T) {
    const index = this.heap.indexOf(element);
    const lastIndex = this.heap.length - 1;

    if (index !== lastIndex) {
      this.swap(index, lastIndex);
      this.heap.pop();
      this.upHeap(index);
      this.downHeap(index);
    } else {
      this.heap.pop();
    }
  }

  enqueue(element: T): void {
    this.heap.push(element);
    this.upHeap(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;

    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const minElement = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.downHeap(0);

    return minElement;
  }

  peek(): T | undefined {
    return this.heap[0];
  }
}

export default PriorityQueue;
