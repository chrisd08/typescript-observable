import "mocha";
import { expect } from "chai";

import { TestChildEvent, TestGrandChildEvent, TestRootEvent } from "./events";
import { Observable, ICancel, IObserver } from "../src";

const NUM_OF_OBSERVERS_TO_ADD = 10;

describe("Observable", () => {
  describe("on", () => {
    it("should be possible to listen to a string and a IObservableEvent", () => {
      const observable = new Observable();

      observable.on("test", () => {});
      observable.on(new TestRootEvent(), () => {});
      observable.on("test", {
        update: () => {},
      });
      observable.on(new TestRootEvent(), {
        update: () => {},
      });
    });

    it("should return a ICancel object", () => {
      const observable = new Observable(),
        cancelFromString = observable.on("test", () => {}),
        cancelFromEvent = observable.on(new TestRootEvent(), () => {});

      expect(cancelFromString).to.haveOwnProperty("cancel");
      expect(cancelFromEvent).to.haveOwnProperty("cancel");
    });
  });

  describe("notifty", () => {
    it("should call the callback", done => {
      const observable = new Observable(),
        flags: { [index: string]: boolean } = {
          stringFunction: false,
          stringObserver: false,
          eventFunction: false,
          eventObserver: false,
          not: true,
        };

      // Check that the right flags are set
      const finishTest = (): void => {
        if (flags["not"] === false) {
          done(new Error('"not-test-root" should not be called '));
        }

        if (Object.keys(flags).every(key => flags[key])) {
          done();
        }
      };

      observable.on("test-root", () => {
        flags["stringFunction"] = true;
        finishTest();
      });

      observable.on("test-root", {
        update: () => {
          flags["stringObserver"] = true;
          finishTest();
        },
      });

      observable.on(new TestRootEvent(), () => {
        flags["eventFunction"] = true;
        finishTest();
      });

      observable.on(new TestRootEvent(), {
        update: () => {
          flags["eventObserver"] = true;
          finishTest();
        },
      });

      observable.on("not-test-root", () => {
        flags["not"] = false;
        finishTest();
      });

      observable.notify(new TestRootEvent(), {});
    });

    it("should propagate to parent events", done => {
      const observable = new Observable(),
        flags: { [index: string]: boolean } = {
          stringChild: false,
          stringParent: false,
          eventChild: false,
          eventParent: false,
          not: true,
        };

      // Check that the right flags are set
      const finishTest = (): void => {
        if (flags["not"] === false) {
          done(new Error('"not-test-root" should not be called '));
        }

        if (Object.keys(flags).every(key => flags[key])) {
          done();
        }
      };

      observable.on("test-child", () => {
        flags["stringChild"] = true;
        finishTest();
      });

      observable.on("test-root", () => {
        flags["stringParent"] = true;
        finishTest();
      });

      observable.on(new TestChildEvent(), () => {
        flags["eventChild"] = true;
        finishTest();
      });

      observable.on(new TestRootEvent(), () => {
        flags["eventParent"] = true;
        finishTest();
      });

      observable.on(new TestGrandChildEvent(), () => {
        flags["not"] = false;
        finishTest();
      });

      observable.notify(new TestChildEvent(), {});
    });

    it("should propagate multiple steps", done => {
      const observable = new Observable(),
        flags: { [index: string]: boolean } = {
          root: false,
          child: false,
          grandChild: false,
        };

      // Check that the right flags are set
      const finishTest = (): void => {
        if (Object.keys(flags).every(key => flags[key])) {
          done();
        }
      };

      observable.on("test-grand-child", () => {
        flags["grandChild"] = true;
        finishTest();
      });

      observable.on("test-child", () => {
        flags["child"] = true;
        finishTest();
      });

      observable.on("test-root", () => {
        flags["root"] = true;
        finishTest();
      });

      observable.notify(new TestGrandChildEvent(), {});
    });

    it("should carry data to the observer", done => {
      const observable = new Observable(),
        data = {};
      let numOfFunctions = 4;

      const finishTest = (): void => {
        if (--numOfFunctions === 0) {
          done();
        }
      };

      observable.on("test-root", item => {
        if (item === data) {
          finishTest();
        } else {
          done(new Error("Given data does not match"));
        }
      });

      observable.on("test-root", {
        update: item => {
          if (item === data) {
            finishTest();
          } else {
            done(new Error("Given data does not match"));
          }
        },
      });

      observable.on(new TestRootEvent(), item => {
        if (item === data) {
          finishTest();
        } else {
          done(new Error("Given data does not match"));
        }
      });

      observable.on(new TestRootEvent(), {
        update: item => {
          if (item === data) {
            finishTest();
          } else {
            done(new Error("Given data does not match"));
          }
        },
      });

      observable.notify(new TestRootEvent(), data);
    });

    it("should not block code", done => {
      const observable = new Observable(),
        stop: number = Date.now() + 25;
      // eslint-disable-next-line prefer-const
      let sync = 0,
        async = 0;

      const finishTest = (): void => {
        if (sync !== 0 && async !== 0 && async >= sync) {
          done();
        }
      };

      observable.on("test-root", () => {
        async = Date.now();
        finishTest();
      });

      observable.notify(new TestRootEvent(), {});

      while (Date.now() < stop) {}

      sync = Date.now();

      if (async !== 0) {
        done(new Error("sync must run first"));
      }

      finishTest();
    });

    it("should give the name of the called event", done => {
      const observable = new Observable();

      observable.on("test-root", (data, name) => {
        if (name === "test-root") {
          done();
        }
      });

      observable.notify(new TestRootEvent(), {});
    });

    it("should give the name of the called event if the child event is called", done => {
      const observable = new Observable();

      observable.on("test-root", (_, name) => {
        if (name === "test-child") {
          done();
        }
      });

      observable.notify(new TestChildEvent(), {});
    });

    it("should return an promise that is resolved when all observers are called", done => {
      const observable = new Observable();
      let shouldBeTrue = false;

      observable.on("test-root", () => {
        shouldBeTrue = true;
      });

      observable.notify(new TestRootEvent(), {}).then(() => {
        if (shouldBeTrue) {
          done();
        }
      });
    });
  });

  describe("off and cancel", () => {
    it("should be possible to cancel an observer", () => {
      // Test remove from every position if added with string
      for (let i = 0; i < NUM_OF_OBSERVERS_TO_ADD; i++) {
        const observable = new Observable();
        let cancel: ICancel | undefined;

        for (let j = 0; j < NUM_OF_OBSERVERS_TO_ADD; j++) {
          const temp = observable.on("test", () => {});
          if (i === j) {
            cancel = temp;
          }
        }

        if (cancel) cancel.cancel();
        expect(observable.count()).to.equal(NUM_OF_OBSERVERS_TO_ADD - 1);
      }

      // Test remove from every position if added with event
      for (let i = 0; i < NUM_OF_OBSERVERS_TO_ADD; i++) {
        const observable = new Observable();
        let cancel: ICancel | undefined;

        for (let j = 0; j < NUM_OF_OBSERVERS_TO_ADD; j++) {
          const temp = observable.on(new TestRootEvent(), () => {});
          if (i === j) {
            cancel = temp;
          }
        }

        if (cancel) cancel.cancel();
        expect(observable.count()).to.equal(NUM_OF_OBSERVERS_TO_ADD - 1);
      }
    });

    it("should be possible to call off on a observer class", () => {
      // Test remove from every position if added with string
      for (let i = 0; i < NUM_OF_OBSERVERS_TO_ADD; i++) {
        const observable = new Observable();
        let object: IObserver | undefined;

        for (let j = 0; j < NUM_OF_OBSERVERS_TO_ADD; j++) {
          const temp = { update: (): void => {} };
          observable.on("test", temp);
          if (i === j) {
            object = temp;
          }
        }

        if (object) observable.off(object);
        expect(observable.count()).to.equal(NUM_OF_OBSERVERS_TO_ADD - 1);
      }

      // Test remove from every position if added with event
      for (let i = 0; i < NUM_OF_OBSERVERS_TO_ADD; i++) {
        const observable = new Observable();
        let object: IObserver | undefined;

        for (let j = 0; j < NUM_OF_OBSERVERS_TO_ADD; j++) {
          const temp = { update: (): void => {} };
          observable.on(new TestRootEvent(), temp);
          if (i === j) {
            object = temp;
          }
        }

        if (object) observable.off(object);
        expect(observable.count()).to.equal(NUM_OF_OBSERVERS_TO_ADD - 1);
      }
    });
  });

  describe("count and clear", () => {
    it("should count the number of items and clear", () => {
      const observable = new Observable();

      // Add observers with string and check that they are added
      for (let i = 0; i < NUM_OF_OBSERVERS_TO_ADD; i++) {
        observable.on("test", () => {});
        expect(observable.count()).to.equal(i + 1);
      }

      // Clear the list and check that they are removed
      observable.clear();
      expect(observable.count()).to.equal(0);

      // Add observers with event and check that they are added
      for (let i = 0; i < NUM_OF_OBSERVERS_TO_ADD; i++) {
        observable.on(new TestRootEvent(), () => {});
        expect(observable.count()).to.equal(i + 1);
      }

      // Clear the list and check that they are removed
      observable.clear();
      expect(observable.count()).to.equal(0);
    });
  });
});
