import "reflect-metadata";

function decorator(...args: any) {
  console.log("Decorator called with " + args.length + " arguments.");
}

function anotherDecorator() {
  return function (object: any, propertyName: any) {
    console.log(
      "Decorator metadata keys: " +
        Reflect.getMetadataKeys?.(object, propertyName),
    );
  };
}

@decorator
export default class DecoratedClass {
  @anotherDecorator()
  decoratedProperty: string;

  @decorator
  get decoratedAccessor() {
    return null;
  }

  @decorator
  decoratedFunction(@decorator decoratedParameter: any) {
    return decoratedParameter;
  }

  constructor() {
    this.decoratedProperty = "foo";
  }
}
