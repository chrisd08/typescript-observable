import { Observable, IChangeObservable, IObservableEvent } from ".";

export class ChangeObservable extends Observable implements IChangeObservable {
  private _isChanged = false;

  get isChanged(): boolean {
    return this._isChanged;
  }

  set isChanged(changed: boolean) {
    this._isChanged = changed;
  }

  notify(event: IObservableEvent, data: unknown): Promise<void> {
    this._isChanged = false;
    return super.notify(event, data);
  }
}
