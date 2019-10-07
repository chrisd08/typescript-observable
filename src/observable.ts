import "core-js/es6/promise";
import "core-js/es6/array";
import "core-js/es6/set";
import {
  IObservable,
  IObserverItem,
  IObservableEvent,
  ObserverCallback,
  IObserver,
  ICancel,
  ObservableEventType,
} from ".";

/**
 * Check if the item is of type IObservableEvent
 * @param tested is the parameter to be tested
 * @return {boolean} true if the item is instance of IObservableEvent, otherwise false
 */
function isObservableEvent(arg: ObservableEventType): arg is IObservableEvent {
  return !!arg && typeof arg !== "string";
}

/**
 * Check if the item is of type IObserver
 * @param arg is the parameter to be tested
 * @return {boolean} true if the item is instance of IObserver, otherwise false
 */
function isObserver(arg: ObserverCallback | IObserver): arg is IObserver {
  return !!arg && typeof arg !== "function";
}

export class Observable implements IObservable {
  private observers: IObserverItem[] = [];

  public count = (): number => this.observers.length;
  public clear = (): void => {
    this.observers.length = 0;
  };

  public on(
    type: ObservableEventType | ObservableEventType[],
    callback: ObserverCallback | IObserver
  ): ICancel {
    const id: ICancel = {
      cancel: () => {
        const index = this.observers.findIndex(item => item.id === id);
        return index > -1 && !!this.observers.splice(index, 1);
      },
    };

    const types = new Set(
      (Array.isArray(type) ? type : [type]).map(item =>
        isObservableEvent(item) ? item.name : item
      )
    );

    this.observers.push({
      id,
      callback,
      types,
    });

    return id;
  }

  public off(observer: IObserver): boolean {
    const index = this.observers.findIndex(item => item.callback === observer);
    return index > -1 && !!this.observers.splice(index, 1);
  }

  public notify(event: IObservableEvent, data: unknown): Promise<void> {
    // Make non-blocking
    return Promise.resolve().then(() => {
      const { name: calledEventName } = event,
        typesToCall = [calledEventName];

      // Select all events to be called
      while (event.parent) {
        event = event.parent;
        typesToCall.push(event.name);
      }

      // Call all observers having the type
      this.observers.forEach(({ types, callback }) => {
        if (typesToCall.some(type => types.has(type))) {
          const call = isObserver(callback) ? callback.update : callback;
          call(data, calledEventName);
        }
      });
    });
  }
}
