import { FixedLengthStack } from './fixed-length-stack';

describe('FixedLengthStack', () => {
  it('should initialize with the correct max size', () => {
    const maxSize = 3;
    const stack = new FixedLengthStack<number>(maxSize);
    expect(stack.size()).toBe(0);
  });

  it('should enstack elements correctly', () => {
    const maxSize = 3;
    const stack = new FixedLengthStack<number>(maxSize);
    stack.enstack(1);
    stack.enstack(2);
    expect(stack.size()).toBe(2);
    expect(stack.peek()).toBe(2);
  });

  it('should destack elements correctly', () => {
    const maxSize = 3;
    const stack = new FixedLengthStack<number>(maxSize);
    stack.enstack(1);
    stack.enstack(2);
    const destackd = stack.destack();
    expect(destackd).toBe(2);
    expect(stack.size()).toBe(1);
  });

  it('should handle peek correctly', () => {
    const maxSize = 2;
    const stack = new FixedLengthStack<string>(maxSize);
    stack.enstack('first');
    stack.enstack('second');
    expect(stack.peek()).toBe('second');
  });

  it('should clear the stack correctly', () => {
    const maxSize = 2;
    const stack = new FixedLengthStack<string>(maxSize);
    stack.enstack('one');
    stack.enstack('two');
    stack.clear();
    expect(stack.size()).toBe(0);
  });

  it('should handle edge case of maxSize 1', () => {
    const maxSize = 1;
    const stack = new FixedLengthStack<number>(maxSize);
    stack.enstack(5);
    stack.enstack(10); // Should replace the previous element
    expect(stack.size()).toBe(1);
    expect(stack.peek()).toBe(10);
  });

  it('should throw an error for max size less than or equal to 0', () => {
    expect(() => new FixedLengthStack<number>(0)).toThrow(
      'Max size must be greater than 0',
    );
    expect(() => new FixedLengthStack<number>(-1)).toThrow(
      'Max size must be greater than 0',
    );
  });
});
