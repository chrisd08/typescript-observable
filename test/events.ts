import { IObservableEvent } from "../src/interfaces/observable-event";

export class TestRootEvent implements IObservableEvent {
  parent = null;
  name = "test-root";
}

export class TestChildEvent implements IObservableEvent {
  parent = new TestRootEvent();
  name = "test-child";
}

export class TestGrandChildEvent implements IObservableEvent {
  parent = new TestChildEvent();
  name = "test-grand-child";
}
