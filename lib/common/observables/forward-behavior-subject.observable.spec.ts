/* eslint-disable jest/no-conditional-expect */
import { Subscription } from 'rxjs';
import { ForwardBehaviorSubject } from './forward-behavior-subject.observable';
describe('ForwardBehaviorSubject', () => {
  const subject = new ForwardBehaviorSubject<number>(0);
  describe('subscribe', () => {
    it('does not emit current value', () => {
      const subscription = subject.subscribe((value) => {
        expect(value).not.toBe(0);
      });
      expect(subject.getValue()).toBe(0);
      subscription.unsubscribe();
    });
    describe.each([1, 2, 5, 10])('invoking next with %p', (nextValue) => {
      let subscription: Subscription;
      afterAll(() => {
        if (subscription) {
          subscription.unsubscribe();
        }
      });
      it(`does emits future values ${nextValue}`, () => {
        if (!subscription) {
          subscription = subject.subscribe((value) => {
            expect(value).toBe(nextValue);
          });
        }
        subject.next(nextValue);
      });
    });
  });
});
