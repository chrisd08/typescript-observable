export interface IObservableEvent {
  parent: IObservableEvent | null;
  name: string;
}

export type ObservableEventType = string | IObservableEvent;