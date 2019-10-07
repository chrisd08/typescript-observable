import 'mocha'
import { expect } from 'chai'
import {ChangeObservable} from "../src/index";
import {TestRootEvent} from "./events";

describe('ChangeObservable', () => {
    describe('hasChanged', () => {
        it('should be false by default', () => {
            const observable = new ChangeObservable();

            expect(observable.isChanged).to.equal(false);
        });

        it('should be able to set isChanged to true', () => {
            const observable = new ChangeObservable();

            observable.isChanged = true;

            expect(observable.isChanged).to.equal(true);
        });

        it('should be able to set isChanged to false', () => {
            const observable = new ChangeObservable();

            observable.isChanged = true;
            observable.isChanged = false;

            expect(observable.isChanged).to.equal(false);
        });

        it('should be false when notify is called', () => {
            const observable = new ChangeObservable();

            observable.isChanged = true;;
            observable.notify(new TestRootEvent(), {});

            expect(observable.isChanged).to.equal(false);
        });
    });
});