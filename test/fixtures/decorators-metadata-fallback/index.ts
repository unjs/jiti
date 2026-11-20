// No reflect-metadata here: the emitted `Reflect.metadata?.(...)` fallback
// must not replace the descriptor that later decorators receive.

function uppercase(
  target: any,
  key: string,
  descriptor: PropertyDescriptor,
): void {
  const original = descriptor.value;

  descriptor.value = function (this: unknown, ...args: any[]) {
    return original.apply(this, args).toUpperCase();
  };
}

class Greeter {
  @uppercase
  greet(name: string): string {
    return "hello " + name;
  }
}

console.log(new Greeter().greet("jiti"));
console.log("value" in Greeter.prototype);
