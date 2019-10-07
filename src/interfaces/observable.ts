import { IObservableEvent, IObserver, ICancel } from ".";
import { ObservableEventType } from "./observable-event";
import { ObserverCallback } from "./observer";

export interface IObservable {
  on(
    type: ObservableEventType | ObservableEventType[],
    callback: ObserverCallback | IObserver
  ): ICancel;
  off(observer: IObserver): boolean;
  count(): number;
  clear(): void;

  notify(event: IObservableEvent, data: unknown): Promise<void>;
}

export interface IChangeObservable extends IObservable {
  isChanged: boolean;
}
