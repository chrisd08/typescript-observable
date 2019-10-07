import "core-js/es6/set";
import { ICancel, ObserverCallback, IObserver } from ".";

export interface IObserverItem {
  id: ICancel;
  types: Set<string>;
  callback: ObserverCallback | IObserver;
}
