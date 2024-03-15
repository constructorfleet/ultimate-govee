/**
 * Represents a fixed-length Last-In-First-Out (LIFO) stack that stores elements of type T.
 */
export class FixedLengthStack<T> {
  private stack: T[];
  private readonly maxSize: number;

  /**
   * Creates a new FixedLengthStack instance with the specified maximum size.
   * @param maxSize The maximum number of elements that the stack can hold (must be greater than 0).
   */
  constructor(maxSize: number) {
    if (maxSize <= 0) {
      throw new Error('Max size must be greater than 0');
    }
    this.maxSize = maxSize;
    this.stack = [];
  }

  /**
   * Retrieves the element at the front of the stack (the most recently added item) without removing it.
   * @returns The element at the front of the stack, or undefined if the stack is empty.
   */
  peek(): T | undefined {
    return this.stack.at(0);
  }

  /**
   * Retrieves the elements in the stack without removing them.
   * @returns The elements in the stack.
   */
  peekAll(): T[] | undefined {
    return this.stack;
  }

  /**
   * Adds an item to the end of the stack. If the stack is full, the oldest item is removed.
   * @param item The item to add to the stack.
   */
  enstack(item: T): void {
    if (this.stack.length >= this.maxSize) {
      this.stack.pop(); // Remove the oldest item
    }
    this.stack.unshift(item);
  }

  /**
   * Removes and returns the item at the front of the stack. If the stack is empty, returns undefined.
   * @returns The item at the front of the stack, or undefined if the stack is empty.
   */
  destack(): T | undefined {
    return this.stack.shift();
  }

  /**
   * Returns the current size of the stack.
   * @returns The number of elements in the stack.
   */
  size(): number {
    return this.stack.length;
  }

  /**
   * Clears all elements from the stack, making it empty.
   */
  clear(): void {
    this.stack = [];
  }
}
