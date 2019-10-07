export interface IObserver {
  update(data: unknown, name?: string): void;
}

export type ObserverCallback = (data: unknown, name?: string) => void;
